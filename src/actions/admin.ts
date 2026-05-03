"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { CompetitionLevel } from "@prisma/client"

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function createProblem(data: {
  code: string
  title: string
  content: string
  level: CompetitionLevel
  difficulty: number
  tags: string[]
}) {
  try {
    await ensureAdmin()
    
    const problem = await prisma.problem.create({
      data: {
        code: data.code,
        title: data.title,
        content: data.content,
        level: data.level,
        difficulty: data.difficulty,
        tags: data.tags
      }
    })

    revalidatePath("/admin/problems")
    revalidatePath("/practice")
    return { success: true, data: problem }
  } catch (error: any) {
    console.error("Failed to create problem:", error)
    return { success: false, error: error.message || "Failed to create problem" }
  }
}

export async function updateProblem(id: string, data: {
  code: string
  title: string
  content: string
  level: CompetitionLevel
  difficulty: number
  tags: string[]
}) {
  try {
    await ensureAdmin()
    
    const problem = await prisma.problem.update({
      where: { id },
      data: {
        code: data.code,
        title: data.title,
        content: data.content,
        level: data.level,
        difficulty: data.difficulty,
        tags: data.tags
      }
    })

    revalidatePath("/admin/problems")
    revalidatePath("/practice")
    revalidatePath(`/practice/${id}`)
    return { success: true, data: problem }
  } catch (error: any) {
    console.error("Failed to update problem:", error)
    return { success: false, error: error.message || "Failed to update problem" }
  }
}

export async function deleteProblem(id: string) {
  try {
    await ensureAdmin()
    
    await prisma.problem.delete({
      where: { id }
    })

    revalidatePath("/admin/problems")
    revalidatePath("/practice")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete problem:", error)
    return { success: false, error: error.message || "Failed to delete problem" }
  }
}
