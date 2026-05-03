"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getPublicProblemSets() {
  try {
    const sets = await prisma.problemSet.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } }
      }
    })
    return { success: true, data: sets }
  } catch (error) {
    return { success: false, error: "Failed to fetch problem sets" }
  }
}

export async function getProblemSetById(id: string) {
  try {
    const problemSet = await prisma.problemSet.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" }
        }
      }
    })
    if (!problemSet) return { success: false, error: "Problem set not found" }
    return { success: true, data: problemSet }
  } catch (error) {
    return { success: false, error: "Failed to fetch problem set" }
  }
}

export async function startAttempt(problemSetId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    // Check if there is an existing incomplete attempt
    const existing = await prisma.problemSetAttempt.findFirst({
      where: {
        userId: session.user.id,
        problemSetId,
        status: "IN_PROGRESS"
      }
    })

    if (existing) {
      return { success: true, data: existing }
    }

    const attempt = await prisma.problemSetAttempt.create({
      data: {
        userId: session.user.id,
        problemSetId,
        status: "IN_PROGRESS"
      }
    })

    revalidatePath("/contests")
    revalidatePath(`/contests/${problemSetId}`)
    return { success: true, data: attempt }
  } catch (error) {
    console.error("Start attempt error:", error)
    return { success: false, error: "Failed to start attempt" }
  }
}

export async function submitAttempt(
  attemptId: string,
  answers: { problemSetItemId: string, content: string }[]
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const attempt = await prisma.problemSetAttempt.findUnique({
      where: { id: attemptId }
    })

    if (!attempt || attempt.userId !== session.user.id) {
      return { success: false, error: "Attempt not found or unauthorized" }
    }

    if (attempt.status !== "IN_PROGRESS") {
      return { success: false, error: "Attempt is already submitted" }
    }

    // Process all answers and save as submissions
    // We will do this sequentially to handle relationships safely
    for (const answer of answers) {
      if (!answer.content || answer.content.trim() === "") continue

      await prisma.submission.create({
        data: {
          userId: session.user.id,
          problemSetItemId: answer.problemSetItemId,
          attemptId: attempt.id,
          content: answer.content,
          status: "PENDING"
        }
      })
    }

    // Update attempt status
    const updatedAttempt = await prisma.problemSetAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        completedAt: new Date()
      }
    })

    revalidatePath("/contests")
    revalidatePath(`/contests/${attempt.problemSetId}`)

    return { success: true, data: updatedAttempt }
  } catch (error) {
    console.error("Submit attempt error:", error)
    return { success: false, error: "Failed to submit attempt" }
  }
}
