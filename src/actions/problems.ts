"use server"

import prisma from "@/lib/prisma"
import { CompetitionLevel } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getProblems(params?: {
  level?: CompetitionLevel;
  tags?: string[];
  minDifficulty?: number;
  maxDifficulty?: number;
  limit?: number;
}) {
  try {
    const problems = await prisma.problem.findMany({
      where: {
        ...(params?.level && { level: params.level }),
        ...(params?.tags && params.tags.length > 0 && {
          tags: { hasSome: params.tags }
        }),
        ...(params?.minDifficulty && { difficulty: { gte: params.minDifficulty } }),
        ...(params?.maxDifficulty && { difficulty: { lte: params.maxDifficulty } }),
        // Only show standalone problems (not part of any Mock Exam)
        problemSets: { none: {} }
      },
      orderBy: {
        difficulty: 'asc'
      },
      take: params?.limit || 50,
      include: {
        _count: {
          select: { submissions: { where: { status: "ACCEPTED" } } }
        }
      }
    })
    
    return { success: true, data: problems }
  } catch (error) {
    console.error("Failed to fetch problems:", error)
    return { success: false, error: "Failed to fetch problems" }
  }
}

export async function getProblemByCode(code: string) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { code },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    })
    
    if (!problem) return { success: false, error: "Problem not found" }
    return { success: true, data: problem }
  } catch (error) {
    console.error("Failed to fetch problem:", error)
    return { success: false, error: "Failed to fetch problem" }
  }
}

export async function getProblemById(id: string) {
  try {
    const problem = await prisma.problem.findFirst({
      where: {
        OR: [
          { id },
          { code: id }
        ]
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    })
    if (!problem) return { success: false, error: "Problem not found" }
    return { success: true, data: problem }
  } catch (error) {
    console.error("Failed to fetch problem:", error)
    return { success: false, error: "Failed to fetch problem" }
  }
}

