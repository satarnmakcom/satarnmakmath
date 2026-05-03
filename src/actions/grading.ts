"use server"

import prisma from "@/lib/prisma"
import { calculateRatingChange, recalculateGlobalRanks } from "@/lib/rating"
import { revalidatePath } from "next/cache"

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
