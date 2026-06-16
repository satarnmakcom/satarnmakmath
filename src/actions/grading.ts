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

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set")
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

    const prompt = `You are an expert Math Olympiad judge. Your task is to grade a student's answer.

STEP 1 - Solve the problem yourself first:
Before evaluating the student, carefully solve the problem on your own to determine the correct answer.

STEP 2 - Compare with the student's answer:
${requiresProof
  ? `This is a proof-based problem (Level: ${problem.level}). The student must provide clear logical reasoning or steps.
- Mark CORRECT if the student's reasoning is mathematically sound and reaches the right conclusion.
- Mark WRONG if only a final answer is given without justification, or if logic is flawed.`
  : `This is a short-answer problem (Level: ${problem.level}). The student only needs to provide the final answer.
- The student MUST provide the final evaluated answer. For example, if the answer is 4, answering "8/2" or "2+2" is WRONG. They must evaluate it to the simplest form (e.g., 4, 1/2, 0.5, etc.).
- Mark CORRECT if the student's answer is the final evaluated form and is mathematically equivalent to the correct answer.
- Mark WRONG if the answer is an unevaluated expression (like 2+2 or 8/2) when it can be easily simplified, or if it is genuinely incorrect.`
}

STEP 3 - Format your response:
First, write out your step-by-step solution and evaluation of the student's answer in plain text.
Then, AT THE VERY END of your response, you MUST include a JSON block wrapped in \`\`\`json ... \`\`\` containing your final verdict.

Example format:
(Your step-by-step analysis and math reasoning goes here...)

\`\`\`json
{
  "isCorrect": true,
  "feedback": "Brief feedback in the same language as the student's answer. If wrong, give a helpful hint. If correct, give encouragement."
}
\`\`\`

Problem:
${problem.content}

Student's Answer:
${data.studentProof}`

    let responseText = ""
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://satarnmakmath.vercel.app',
          'X-Title': 'Satarnmak Math',
        }
      })

      const completion: any = await openai.chat.completions.create({
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 16384,
        stream: true
      } as any)

      console.log("\\n--- AI Grading Stream Started ---")
      for await (const chunk of completion) {
        const reasoning = (chunk.choices[0]?.delta as any)?.reasoning_content;
        if (reasoning) process.stdout.write(reasoning);
        
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          process.stdout.write(content);
          responseText += content;
        }
      }
      console.log("\\n--- AI Grading Stream Ended ---")
    } catch (e: any) {
      console.error("Failed to fetch from NVIDIA NIM API:", e)
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

    const apiKey = process.env.OPENROUTER_API_KEY
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
      const prompt = `You are an expert Math Olympiad judge. Your task is to grade a student's answer.

STEP 1 - Solve the problem yourself first:
Carefully solve the problem to determine the correct answer before evaluating.

STEP 2 - Compare with the student's answer:
${requiresProof
  ? `This is a proof-based problem (Level: ${sub.problem.level}). The student must show logical reasoning.
- Mark CORRECT if reasoning is mathematically valid and reaches the right conclusion.
- Mark WRONG if only a bare answer without justification, or if logic is flawed.`
  : `This is a short-answer problem (Level: ${sub.problem.level}). Only the final answer matters.
- The student MUST provide the final evaluated answer. For example, if the answer is 4, answering "8/2" or "2*2" is WRONG. They must evaluate it to the simplest form.
- Mark CORRECT if the student's answer is the final evaluated form and is mathematically equivalent to the correct answer.
- Mark WRONG if the answer is an unevaluated expression (like 2+2 or 8/2) when it can be easily simplified, or if it is genuinely incorrect.`
}

STEP 3 - Format your response:
First, write out your step-by-step solution and evaluation of the student's answer in plain text.
Then, AT THE VERY END of your response, you MUST include a JSON block wrapped in \`\`\`json ... \`\`\` containing your final verdict.

Example format:
(Your step-by-step analysis and math reasoning goes here...)

\`\`\`json
{
  "isCorrect": true,
  "feedback": "Brief feedback. If wrong, give a helpful hint."
}
\`\`\`

Problem:
${sub.problem.content}

Student's Answer:
${sub.content}`

      let isCorrect = false
      let feedback = ""
      
      try {
        const openai = new OpenAI({
          apiKey: apiKey,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'https://satarnmakmath.vercel.app',
            'X-Title': 'Satarnmak Math',
          }
        })

        const completion: any = await openai.chat.completions.create({
          model: "nvidia/nemotron-3-ultra-550b-a55b:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 1,
          top_p: 0.95,
          max_tokens: 16384,
          stream: true
        } as any)

        let responseText = ""
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            responseText += content;
          }
        }
        
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
