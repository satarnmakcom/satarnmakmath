"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(userId: string, data: {
  name?: string
  country?: string
  image?: string
}) {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.image !== undefined && { image: data.image }),
      }
    })

    revalidatePath("/profile")
    revalidatePath("/")

    return { success: true, data: updated }
  } catch (error: any) {
    console.error("Failed to update profile:", error)
    return { success: false, error: error?.message || "Failed to update profile" }
  }
}

export async function changePassword(userId: string, data: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const bcrypt = await import("bcrypt")

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.password) {
      return { success: false, error: "User not found or uses OAuth login" }
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password)
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to change password:", error)
    return { success: false, error: "Failed to change password" }
  }
}
