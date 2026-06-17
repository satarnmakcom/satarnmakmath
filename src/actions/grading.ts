"use server"

import prisma from "@/lib/prisma"
import { calculateRatingChange, recalculateGlobalRanks } from "@/lib/rating"
import { revalidatePath } from "next/cache"
import OpenAI from "openai"

/**
 * Self-grade a submission (honor system).
 * Updates the submission status and recalculates user rating.
 */
export async function selfGradeSolution(data: {
  submissionId: string
  userId: string
  isCorrect: boolean
}) {
  try {
    // 1. Get the submission + problem info
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      include: { problem: true }
    })

    if (!submission) {
      return { success: false, error: "Submission not found" }
    }

    if (submission.status !== "PENDING") {
      return { success: false, error: "This submission has already been graded" }
    }

    // 2. Check if this is the FIRST attempt at this problem (no rating change on retry)
    const previousCount = await prisma.submission.count({
      where: {
        userId: data.userId,
        problemId: submission.problemId,
        id: { not: data.submissionId }
      }
    })
    const isFirstAttempt = previousCount === 0

    // 3. Update submission status
    const newStatus = data.isCorrect ? "ACCEPTED" : "WRONG_ANSWER"

    // 4. Get user's current rating
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    let ratingDelta = 0
    let newRating = user.rating

    if (isFirstAttempt) {
      // 5. Calculate rating change only on first attempt
      const difficulty = submission.problem?.difficulty ?? 1200
      ratingDelta = calculateRatingChange(user.rating, difficulty, data.isCorrect)
      newRating = Math.max(0, user.rating + ratingDelta)

      await prisma.user.update({
        where: { id: data.userId },
        data: { rating: newRating }
      })
      await recalculateGlobalRanks(prisma)
    }

    // 6. Update submission with status and ratingDelta
    await prisma.submission.update({
      where: { id: data.submissionId },
      data: { status: newStatus, ratingDelta: ratingDelta || 0 }
    })

    // 7. Revalidate pages
    revalidatePath("/")
    revalidatePath("/profile")
    revalidatePath("/leaderboard")

    return {
      success: true,
      data: {
        status: newStatus,
        ratingDelta: ratingDelta || 0,
        newRating,
        isRetry: !isFirstAttempt
      }
    }
  } catch (error) {
    console.error("Failed to grade solution:", error)
    return { success: false, error: "Failed to grade solution" }
  }
}

/**
 * AI-grade a submission using Gemini.
 * Allows retry: if user already solved this problem before, no rating change.
 */
export async function aiGradeSolution(data: {
  submissionId: string
  userId: string
  problemId: string
  studentProof: string
}) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: data.problemId }
    })

    if (!problem) {
      return { success: false, error: "Problem not found" }
    }

    // Check if this is the user's FIRST EVER attempt at this problem
    // In Hardcore mode, rating ONLY changes on the first try.
    const previousSubmissionsCount = await prisma.submission.count({
      where: {
        userId: data.userId,
        problemId: data.problemId,
        id: { not: data.submissionId }
      }
    })
    const isFirstAttempt = previousSubmissionsCount === 0

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set")
      return { success: false, error: "AI grading is not configured properly." }
    }

    if (!data.studentProof || data.studentProof.trim() === '') {
      // Empty answer: Return 0 / WRONG_ANSWER immediately
      const isCorrect = false;
      let ratingDelta = 0;
      let newRating = 1200; // placeholder, will calculate below

      const user = await prisma.user.findUnique({ where: { id: data.userId } })
      if (!user) return { success: false, error: "User not found" }
      newRating = user.rating;

      if (isFirstAttempt) {
        ratingDelta = calculateRatingChange(user.rating, problem.difficulty, isCorrect)
        newRating = Math.max(0, user.rating + ratingDelta)
        await prisma.user.update({
          where: { id: data.userId },
          data: { rating: newRating }
        })
        await recalculateGlobalRanks(prisma)
      }

      await prisma.submission.update({
        where: { id: data.submissionId },
        data: {
          status: "WRONG_ANSWER",
          ratingDelta: ratingDelta || 0,
          feedback: "No answer provided. Please try again."
        }
      })

      revalidatePath("/")
      revalidatePath("/profile")
      revalidatePath("/leaderboard")

      return {
        success: true,
        data: {
          status: "WRONG_ANSWER",
          ratingDelta,
          newRating,
          isCorrect,
          isRetry: !isFirstAttempt,
          feedback: "No answer provided. Please try again."
        }
      }
    }

    const requiresProof = problem.level !== 'POSN'
    const officialAnswer = (problem as any).answer as string | null | undefined

    const systemPrompt = `You are the world's most rigorous and accurate Mathematics Olympiad judge, equivalent to an IMO (International Mathematical Olympiad) problem setter and checker. You have PhD-level expertise in all branches of mathematics including Number Theory, Combinatorics, Algebra, and Geometry.

Your ONLY job is to determine whether a student's answer is mathematically correct. You MUST follow a STRICT analytical process:
- Step 1: Semantic Parsing. Carefully extract the mathematical meaning of both the student's answer and the official answer.
- Step 2: Mathematical Equivalence. Prove or disprove that the two answers represent the exact same mathematical value or concept. Do not rely on superficial string matching.
- Step 3: Simplification Check. Be UNFORGIVING on form. If the answer is "8/2", "2+2", "√16", or "sin(90°)", it is WRONG because it is not evaluated.
- Step 4: Final Verdict. Conclude based on the evidence. Never give the benefit of the doubt.
- CRITICAL: NEVER reveal the official answer in your feedback.`

    const userPrompt = `## GRADING TASK

${
  officialAnswer
    ? `### ✅ OFFICIAL ANSWER PROVIDED
The official correct answer is: **${officialAnswer}**
Do NOT solve the problem yourself. Use this official answer as ground truth.

### CHAIN-OF-THOUGHT — Verify the Student's Answer
Think through these steps:
1. Parse the student's answer carefully.
2. Check if it is mathematically equivalent to the official answer.
3. Check if it is in the required simplified/evaluated form.
4. State your conclusion clearly.`
    : `### PHASE 1 — Solve the Problem Yourself (Chain-of-Thought)
No official answer was provided. You MUST solve this problem yourself first.
Think through the solution step-by-step. Show ALL your working. Do not skip steps.

### PHASE 2 — Verify the Student's Answer
Now compare the student's answer to YOUR derived answer.`
}

### EVALUATION RUBRIC
${requiresProof
  ? `**Problem Type: PROOF-BASED (Level: ${problem.level})**
- CORRECT ✅: Student shows a complete, logically valid proof reaching the correct conclusion.
- WRONG ❌: Bare answer without proof, logical gaps, wrong conclusion, circular reasoning, or incomplete argument.
- NOTE: A correct final answer WITHOUT a valid proof is still WRONG.`
  : `**Problem Type: SHORT ANSWER (Level: ${problem.level})**
The answer MUST be in simplest evaluated form:
- CORRECT ✅: Mathematically equivalent to the true answer AND in simplest form.
- WRONG ❌ (form wrong): "2+2", "8/2", "√16", "3!", "sin(90°)" — must be evaluated.
- WRONG ❌ (form wrong): "2/4" when answer is "1/2" — must be in lowest terms.
- CORRECT ✅: "0.5" when answer is "1/2" — acceptable decimal equivalent.
- WRONG ❌: Incorrect numerical value.

Examples:
  True=4 → "2+2" ❌ | "8/2" ❌ | "2²" ❌ | "4" ✅ | "4.0" ✅
  True=1/2 → "2/4" ❌ | "0.5" ✅ | "1/2" ✅`
}

### OUTPUT FORMAT
First write your chain-of-thought reasoning in plain text (mandatory).
Then output EXACTLY this JSON block at the very end:

\`\`\`json
{
  "isCorrect": <true|false>,
  "feedback": "<Respond in the same language the student used. If WRONG: explain exactly why (but do NOT reveal the correct answer). If CORRECT: brief congratulations.>"
}
\`\`\`

---

### Problem:
${problem.content}

### Student's Answer:
${data.studentProof}`

    let responseText = ""
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      })

      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.0,
        max_tokens: 4096,
        stream: false
      })

      responseText = completion.choices?.[0]?.message?.content || ""
    } catch (e: any) {
      console.error("Failed to fetch from Groq API:", e)
      return { success: false, error: e.message || "AI API request failed" }
    }

    // Parse the JSON output safely
    let aiResult
    try {
      // Try to find JSON inside markdown block first, fallback to any JSON-like object
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i) || responseText.match(/\{[\s\S]*\}/)
      let jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText
      
      // Sanitize unescaped backslashes and control characters
      jsonString = jsonString
        .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
        .replace(/[\u0000-\u001F]+/g, " ")
        
      aiResult = JSON.parse(jsonString)
    } catch (e: any) {
      console.error("Failed to parse AI output:", responseText, e)
      return { success: false, error: e?.message || "AI returned invalid format" }
    }

    const isCorrect = aiResult.isCorrect === true
    const newStatus = isCorrect ? "ACCEPTED" : "WRONG_ANSWER"

    // Get user first to calculate rating
    const user = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) return { success: false, error: "User not found" }

    let ratingDelta = 0
    let newRating = user.rating

    if (isFirstAttempt) {
      ratingDelta = calculateRatingChange(user.rating, problem.difficulty, isCorrect)
      newRating = Math.max(0, user.rating + ratingDelta)
      await prisma.user.update({
        where: { id: data.userId },
        data: { rating: newRating }
      })
      await recalculateGlobalRanks(prisma)
    }

    // Update submission status, ratingDelta, and feedback
    await prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        status: newStatus,
        ratingDelta: ratingDelta || 0, // prevent -0
        feedback: aiResult.feedback as string
      }
    })

    revalidatePath("/")
    revalidatePath("/profile")
    revalidatePath("/leaderboard")

    return {
      success: true,
      error: undefined,
      data: {
        status: newStatus,
        ratingDelta,
        newRating,
        isCorrect,
        isRetry: !isFirstAttempt,
        feedback: aiResult.feedback as string
      }
    }
  } catch (error: any) {
    console.error("Failed to grade AI solution:", error)
    return { success: false, error: error?.message || "Failed to grade solution via AI" }
  }
}

/**
 * Batch AI-grade all submissions in a ProblemSetAttempt
 */
export async function aiGradeAttempt(attemptId: string) {
  try {
    const attempt = await prisma.problemSetAttempt.findUnique({
      where: { id: attemptId },
      include: {
        submissions: { include: { problem: true } },
        user: true
      }
    })

    if (!attempt || attempt.status !== "SUBMITTED") {
      return { success: false, error: "Attempt not found or not submitted" }
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return { success: false, error: "AI grading is not configured properly." }
    }

    // Check if this is the first completed attempt for this problem set
    const previousAttemptsCount = await prisma.problemSetAttempt.count({
      where: {
        userId: attempt.userId,
        problemSetId: attempt.problemSetId,
        id: { not: attempt.id },
        status: { in: ["SUBMITTED", "GRADED"] }
      }
    })
    const isFirstAttempt = previousAttemptsCount === 0

    let totalRatingDelta = 0

    // Grade all submissions in PARALLEL to prevent Vercel 15s timeout
    const gradingPromises = attempt.submissions.map(async (sub) => {
      if (sub.status !== "PENDING" || !sub.problem) return null

      if (!sub.content || sub.content.trim() === '') {
        return { sub, isCorrect: false, feedback: "No answer provided.", empty: true }
      }

      const requiresProof = sub.problem.level !== 'POSN'
      const officialAnswer = (sub.problem as any).answer as string | null | undefined

      const systemPrompt = `You are the world's most rigorous and accurate Mathematics Olympiad judge, equivalent to an IMO (International Mathematical Olympiad) problem setter and checker. You have PhD-level expertise in all branches of mathematics including Number Theory, Combinatorics, Algebra, and Geometry.

Your ONLY job is to determine whether a student's answer is mathematically correct. You MUST follow a STRICT analytical process:
- Step 1: Semantic Parsing. Carefully extract the mathematical meaning of both the student's answer and the official answer.
- Step 2: Mathematical Equivalence. Prove or disprove that the two answers represent the exact same mathematical value or concept. Do not rely on superficial string matching.
- Step 3: Simplification Check. Be UNFORGIVING on form. If the answer is "8/2", "2+2", "√16", or "sin(90°)", it is WRONG because it is not evaluated.
- Step 4: Final Verdict. Conclude based on the evidence. Never give the benefit of the doubt.
- CRITICAL: NEVER reveal the official answer in your feedback.`

      const prompt = `## GRADING TASK

${
  officialAnswer
    ? `### ✅ OFFICIAL ANSWER PROVIDED
The official correct answer is: **${officialAnswer}**
Do NOT solve the problem yourself. Use this official answer as ground truth.

### CHAIN-OF-THOUGHT — Verify the Student's Answer
Think through these steps:
1. Parse the student's answer carefully.
2. Check if it is mathematically equivalent to the official answer.
3. Check if it is in the required simplified/evaluated form.
4. State your conclusion clearly.`
    : `### PHASE 1 — Solve the Problem Yourself (Chain-of-Thought)
No official answer was provided. You MUST solve this problem yourself first.
Think through the solution step-by-step. Show ALL your working. Do not skip steps.

### PHASE 2 — Verify the Student's Answer
Now compare the student's answer to YOUR derived answer.`
}

### EVALUATION RUBRIC
${requiresProof
  ? `**Problem Type: PROOF-BASED (Level: ${sub.problem.level})**
- CORRECT ✅: Student shows a complete, logically valid proof reaching the correct conclusion.
- WRONG ❌: Bare answer without proof, logical gaps, wrong conclusion, circular reasoning, or incomplete argument.
- NOTE: A correct final answer WITHOUT a valid proof is still WRONG.`
  : `**Problem Type: SHORT ANSWER (Level: ${sub.problem.level})**
The answer MUST be in simplest evaluated form:
- CORRECT ✅: Mathematically equivalent to the true answer AND in simplest form.
- WRONG ❌ (form wrong): "2+2", "8/2", "√16", "3!", "sin(90°)" — must be evaluated.
- WRONG ❌ (form wrong): "2/4" when answer is "1/2" — must be in lowest terms.
- CORRECT ✅: "0.5" when answer is "1/2" — acceptable decimal equivalent.
- WRONG ❌: Incorrect numerical value.

Examples:
  True=4 → "2+2" ❌ | "8/2" ❌ | "2²" ❌ | "4" ✅ | "4.0" ✅
  True=1/2 → "2/4" ❌ | "0.5" ✅ | "1/2" ✅`
}

### OUTPUT FORMAT
First write your chain-of-thought reasoning in plain text (mandatory).
Then output EXACTLY this JSON block at the very end:

\`\`\`json
{
  "isCorrect": <true|false>,
  "feedback": "<Respond in the same language the student used. If WRONG: explain exactly why (but do NOT reveal the correct answer). If CORRECT: brief congratulations.>"
}
\`\`\`

---

### Problem:
${sub.problem.content}

### Student's Answer:
${sub.content}`

      let isCorrect = false
      let feedback = ""
      
      try {
        const openai = new OpenAI({
          apiKey: apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        })

        const completion = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.0,
          max_tokens: 4096,
          stream: false
        })

        const responseText = completion.choices?.[0]?.message?.content || ""

        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i) || responseText.match(/\{[\s\S]*\}/)
        let jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText
        
        // Sanitize unescaped backslashes and control characters
        jsonString = jsonString
          .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
          .replace(/[\u0000-\u001F]+/g, " ")
          
        const aiResult = JSON.parse(jsonString)
        isCorrect = aiResult.isCorrect === true
        feedback = aiResult.feedback || ""
      } catch (e) {
        console.error("AI grading failed for submission", sub.id, e)
        feedback = "Grading failed due to AI error."
      }

      return { sub, isCorrect, feedback, empty: false }
    })

    const gradedResults = await Promise.all(gradingPromises)

    for (const result of gradedResults) {
      if (!result) continue; // skipped

      const { sub, isCorrect, feedback } = result;
      const newStatus = isCorrect ? "ACCEPTED" : "WRONG_ANSWER"
      let submissionDelta = 0

      if (isFirstAttempt) {
        submissionDelta = calculateRatingChange(attempt.user.rating + totalRatingDelta, sub.problem.difficulty, isCorrect)
        totalRatingDelta += submissionDelta
      }

      await prisma.submission.update({
        where: { id: sub.id },
        data: { 
          status: newStatus,
          ratingDelta: submissionDelta,
          feedback: feedback
        }
      })
    }

    // Apply rating delta to user
    const newRating = Math.max(0, attempt.user.rating + totalRatingDelta)
    await prisma.user.update({
      where: { id: attempt.userId },
      data: { rating: newRating }
    })
    
    await recalculateGlobalRanks(prisma)

    // Mark attempt as graded
    const finalAttempt = await prisma.problemSetAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "GRADED",
        score: totalRatingDelta
      },
      include: { submissions: true }
    })

    revalidatePath("/profile")
    revalidatePath("/leaderboard")
    revalidatePath(`/contests/${attempt.problemSetId}`)

    return { success: true, data: finalAttempt }
  } catch (error) {
    console.error("Batch AI grade error:", error)
    return { success: false, error: "Failed to grade attempt" }
  }
}
