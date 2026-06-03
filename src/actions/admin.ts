"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { CompetitionLevel } from "@prisma/client"
import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

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
  hints?: string[]
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
        tags: data.tags,
        hints: data.hints || []
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
  hints?: string[]
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
        tags: data.tags,
        hints: data.hints || []
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

// ─────────────────────────── Problem Sets ───────────────────────────────────

export async function createProblemSet(data: {
  title: string
  description?: string
  timeLimitMinutes: number
  isPublic: boolean
  problems: { problemId?: string, content: string, level: any, difficulty: number }[]
}) {
  try {
    await ensureAdmin()
    
    // First, create all new problems globally
    const createdProblems = await Promise.all(
      data.problems.map(async (p, index) => {
        return await prisma.problem.create({
          data: {
            title: `${data.title} - Question ${index + 1}`,
            code: `${data.title.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}-Q${index + 1}-${Date.now().toString().slice(-4)}`,
            content: p.content,
            level: p.level,
            difficulty: p.difficulty,
            tags: ["Mock Exam"]
          }
        })
      })
    )

    const problemSet = await prisma.problemSet.create({
      data: {
        title: data.title,
        description: data.description,
        timeLimitMinutes: data.timeLimitMinutes,
        isPublic: data.isPublic,
        items: {
          create: createdProblems.map((cp, index) => ({
            problemId: cp.id,
            order: index
          }))
        }
      }
    })

    revalidatePath("/admin/problem-sets")
    revalidatePath("/contests")
    return { success: true, data: problemSet }
  } catch (error: any) {
    console.error("Create ProblemSet error:", error)
    return { success: false, error: error.message || "Failed to create problem set" }
  }
}

export async function updateProblemSet(id: string, data: {
  title: string
  description?: string
  timeLimitMinutes: number
  isPublic: boolean
  problems: { problemId?: string, content: string, level: any, difficulty: number }[]
}) {
  try {
    await ensureAdmin()

    // Process problems: Update existing ones, create new ones
    const processedProblems = await Promise.all(
      data.problems.map(async (p, index) => {
        if (p.problemId) {
          return await prisma.problem.update({
            where: { id: p.problemId },
            data: {
              content: p.content,
              level: p.level,
              difficulty: p.difficulty
            }
          })
        } else {
          return await prisma.problem.create({
            data: {
              title: `${data.title} - Question ${index + 1}`,
              code: `${data.title.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}-Q${index + 1}-${Date.now().toString().slice(-4)}`,
              content: p.content,
              level: p.level,
              difficulty: p.difficulty,
              tags: ["Mock Exam"]
            }
          })
        }
      })
    )

    // Delete old items and recreate with correct order
    await prisma.$transaction([
      prisma.problemSetItem.deleteMany({ where: { problemSetId: id } }),
      prisma.problemSet.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          timeLimitMinutes: data.timeLimitMinutes,
          isPublic: data.isPublic,
          items: {
            create: processedProblems.map((cp, index) => ({
              problemId: cp.id,
              order: index
            }))
          }
        }
      })
    ])

    revalidatePath("/admin/problem-sets")
    revalidatePath("/contests")
    return { success: true }
  } catch (error: any) {
    console.error("Update ProblemSet error:", error)
    return { success: false, error: error.message || "Failed to update problem set" }
  }
}

export async function deleteProblemSet(id: string) {
  try {
    await ensureAdmin()
    await prisma.problemSet.delete({ where: { id } })
    revalidatePath("/admin/problem-sets")
    revalidatePath("/contests")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete problem set" }
  }
}
export async function toggleUserRole(userId: string) {
  try {
    await ensureAdmin()
    
    const session = await getServerSession(authOptions)
    if (session?.user?.id === userId) {
      return { success: false, error: "Cannot change your own role" }
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return { success: false, error: "User not found" }

    const newRole = targetUser.role === "ADMIN" ? "USER" : "ADMIN"

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    revalidatePath(/user/ + userId)
    revalidatePath(/user/ + encodeURIComponent(targetUser.name || ""))
    return { success: true, newRole }
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed" }
  }
}

export async function toggleUserBan(userId: string) {
  try {
    await ensureAdmin()
    
    const session = await getServerSession(authOptions)
    if (session?.user?.id === userId) {
      return { success: false, error: "Cannot ban yourself" }
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return { success: false, error: "User not found" }

    const newBanStatus = !targetUser.isBanned

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: newBanStatus }
    })

    revalidatePath(/user/ + userId)
    revalidatePath(/user/ + encodeURIComponent(targetUser.name || ""))
    return { success: true, isBanned: newBanStatus }
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed" }
  }
}

export async function uploadSvgAction(formData: FormData) {
  try {
    await ensureAdmin()
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    const validExtensions = [".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"]
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    if (!validExtensions.includes(ext)) {
      return { success: false, error: "Only SVG, PNG, JPG, JPEG, WEBP, or GIF files are allowed" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // For Vercel deployment, we cannot write to the local filesystem.
    // Instead, we convert the image (especially SVG) to a Base64 Data URI
    // which can be embedded directly in the markdown.
    const mimeType = file.type || "image/svg+xml"
    const base64Data = buffer.toString("base64")
    const dataUri = `data:${mimeType};base64,${base64Data}`

    return { success: true, url: dataUri }
  } catch (error: any) {
    console.error("Upload error:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}
