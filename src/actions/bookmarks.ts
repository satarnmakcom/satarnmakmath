"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function toggleBookmark(problemId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Not logged in" }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problemId
        }
      }
    })

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      })
      revalidatePath(`/practice/${problemId}`)
      revalidatePath("/practice")
      return { success: true, bookmarked: false }
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          problemId: problemId
        }
      })
      revalidatePath(`/practice/${problemId}`)
      revalidatePath("/practice")
      return { success: true, bookmarked: true }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle bookmark" }
  }
}

export async function checkBookmarkStatus(problemId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: true, bookmarked: false }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problemId
        }
      }
    })

    return { success: true, bookmarked: !!existing }
  } catch (error) {
    return { success: false, bookmarked: false }
  }
}
