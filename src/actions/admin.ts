"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

// Helper to check if current user is admin
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required")
  }
  return session.user
}

export async function toggleUserRole(userId: string) {
  try {
    const admin = await checkAdmin()
    
    // Prevent removing your own admin status accidentally
    if (admin.id === userId) {
      return { success: false, error: "Cannot change your own role" }
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return { success: false, error: "User not found" }

    const newRole = targetUser.role === "ADMIN" ? "USER" : "ADMIN"

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    revalidatePath(`/user/${userId}`)
    revalidatePath(`/user/${encodeURIComponent(targetUser.name || "")}`)
    return { success: true, newRole }
  } catch (error: any) {
    console.error("Failed to toggle role:", error)
    return { success: false, error: error?.message || "Failed to toggle role" }
  }
}

export async function toggleUserBan(userId: string) {
  try {
    const admin = await checkAdmin()
    
    if (admin.id === userId) {
      return { success: false, error: "Cannot ban yourself" }
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return { success: false, error: "User not found" }

    const newBanStatus = !targetUser.isBanned

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: newBanStatus }
    })

    revalidatePath(`/user/${userId}`)
    revalidatePath(`/user/${encodeURIComponent(targetUser.name || "")}`)
    return { success: true, isBanned: newBanStatus }
  } catch (error: any) {
    console.error("Failed to toggle ban status:", error)
    return { success: false, error: error?.message || "Failed to toggle ban status" }
  }
}
