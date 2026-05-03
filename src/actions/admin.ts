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

// ─────────────────────────── Problems ───────────────────────────────────────

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
    return { success: false, error: error.message || "Failed to update problem" }
  }
}

export async function deleteProblem(id: string) {
  try {
    await ensureAdmin()
    await prisma.problem.delete({ where: { id } })
    revalidatePath("/admin/problems")
    revalidatePath("/practice")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete problem" }
  }
}

// ─────────────────────────── Curriculum Modules ─────────────────────────────

export async function createModule(data: {
  title: string
  description?: string
  level: CompetitionLevel
  order: number
}) {
  try {
    await ensureAdmin()
    const mod = await prisma.curriculumModule.create({ data })
    revalidatePath("/admin/curriculum")
    revalidatePath("/learn")
    return { success: true, data: mod }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create module" }
  }
}

export async function updateModule(id: string, data: {
  title: string
  description?: string
  level: CompetitionLevel
  order: number
}) {
  try {
    await ensureAdmin()
    const mod = await prisma.curriculumModule.update({ where: { id }, data })
    revalidatePath("/admin/curriculum")
    revalidatePath("/learn")
    return { success: true, data: mod }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update module" }
  }
}

export async function deleteModule(id: string) {
  try {
    await ensureAdmin()
    // Also delete all lessons in this module
    await prisma.lesson.deleteMany({ where: { moduleId: id } })
    await prisma.curriculumModule.delete({ where: { id } })
    revalidatePath("/admin/curriculum")
    revalidatePath("/learn")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete module" }
  }
}

// ─────────────────────────── Lessons ────────────────────────────────────────

export async function createLesson(data: {
  moduleId: string
  title: string
  content: string
  order: number
  videoUrl?: string
}) {
  try {
    await ensureAdmin()
    const lesson = await prisma.lesson.create({ data })
    revalidatePath("/admin/curriculum")
    return { success: true, data: lesson }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create lesson" }
  }
}

export async function updateLesson(id: string, data: {
  title: string
  content: string
  order: number
  videoUrl?: string
}) {
  try {
    await ensureAdmin()
    const lesson = await prisma.lesson.update({ where: { id }, data })
    revalidatePath("/admin/curriculum")
    return { success: true, data: lesson }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update lesson" }
  }
}

export async function deleteLesson(id: string) {
  try {
    await ensureAdmin()
    await prisma.lesson.delete({ where: { id } })
    revalidatePath("/admin/curriculum")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete lesson" }
  }
}
