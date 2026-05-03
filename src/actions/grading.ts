"use server"

import prisma from "@/lib/prisma"
import { calculateRatingChange, recalculateGlobalRanks } from "@/lib/rating"
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

    // 2. Update submission status
    const newStatus = data.isCorrect ? "ACCEPTED" : "WRONG_ANSWER"
    await prisma.submission.update({
      where: { id: data.submissionId },
      data: { status: newStatus }
    })

    // 3. Get user's current rating
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // 4. Calculate rating change
    const ratingDelta = calculateRatingChange(
      user.rating,
      submission.problem.difficulty,
      data.isCorrect
    )

    const newRating = Math.max(0, user.rating + ratingDelta) // Never go below 0

    // 5. Update user rating
    await prisma.user.update({
      where: { id: data.userId },
      data: { rating: newRating }
    })

    // 6. Recalculate global ranks
    await recalculateGlobalRanks(prisma)

    // 7. Revalidate pages
    revalidatePath("/")
    revalidatePath("/profile")
    revalidatePath("/leaderboard")

    return {
      success: true,
      data: {
        status: newStatus,
        ratingDelta,
        newRating
      }
    }
  } catch (error) {
    console.error("Failed to grade solution:", error)
    return { success: false, error: "Failed to grade solution" }
  }
}

/**
 * AI-grade a submission using Gemini.
 */
export async function aiGradeSolution(data: {
  submissionId: string
  userId: string
  problemId: string
  studentProof: string
}) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY is not configured" }
    }

    const problem = await prisma.problem.findUnique({
      where: { id: data.problemId }
    })

    if (!problem) {
      return { success: false, error: "Problem not found" }
    }

    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId }
    })

    if (!submission || submission.status !== "PENDING") {
      return { success: false, error: "Submission not found or already graded" }
    }

    // Hardcoding the new key to prevent Vercel's old Environment Variables from overriding it
    const apiKey = "AIzaSyDqo7VolldAwT6bMOGP-wiO3SS3518nVAI"
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is not configured" }
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Changed to Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `You are an expert Math Olympiad Grader (specifically for POSN Camp 1).
IMPORTANT: These are short-answer / fill-in-the-blank questions. The student DOES NOT need to provide a formal proof.
Evaluate the student's answer based primarily on the final answer's correctness. If it is mathematically equivalent to the correct answer, mark it as correct.
Return your evaluation as a valid JSON object EXACTLY in this format:
{
  "isCorrect": boolean,
  "feedback": "Your concise, constructive feedback. If incorrect, provide a brief hint but do not give the full solution."
}

Problem Statement:
${problem.content}

Student's Answer:
${data.studentProof}

Remember, return ONLY valid JSON.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Parse the JSON output safely
    let aiResult
    try {
      // Find JSON block in case AI wraps it in markdown
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : response
      aiResult = JSON.parse(jsonString)
    } catch (e) {
      console.error("Failed to parse AI output:", response)
      return { success: false, error: "AI returned invalid format" }
    }

    const isCorrect = aiResult.isCorrect === true

    // Now re-use the self-grading logic to update DB and rating
    const dbResult = await selfGradeSolution({
      submissionId: data.submissionId,
      userId: data.userId,
      isCorrect
    })

    if (!dbResult.success || !dbResult.data) {
      return dbResult
    }

    return {
      success: true,
      error: undefined,
      data: {
        status: dbResult.data.status,
        ratingDelta: dbResult.data.ratingDelta,
        newRating: dbResult.data.newRating,
        isCorrect,
        feedback: aiResult.feedback
      }
    }
  } catch (error) {
    console.error("Failed to AI grade solution:", error)
    return { success: false, error: "Failed to grade solution via AI" }
  }
}

