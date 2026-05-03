"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function submitProblemSolution(data: {
  userId: string;
  problemId: string;
  content: string; // LaTeX proof content
}) {
  try {
    // Basic validation
    if (!data.content || data.content.trim().length === 0) {
      return { success: false, error: "Submission content cannot be empty." }
    }

    const submission = await prisma.submission.create({
      data: {
        userId: data.userId,
        problemId: data.problemId,
        content: data.content,
        status: "PENDING" // Pending manual review or AI grading
      }
    })

    // Revalidate relevant pages
    revalidatePath("/archive")
    revalidatePath("/profile")
    revalidatePath(`/problem/${data.problemId}`)

    return { success: true, data: submission }
  } catch (error: any) {
    console.error("Failed to submit solution:", error)
    return { success: false, error: error?.message || "Failed to submit solution" }
  }
}

export async function getUserSubmissions(userId: string) {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: {
        problem: {
          select: { code: true, title: true, difficulty: true, level: true }
        }
      }
    })
    return { success: true, data: submissions }
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return { success: false, error: "Failed to fetch submissions" }
  }
}
