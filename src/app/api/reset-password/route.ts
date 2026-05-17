import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json({ error: "Token has expired. Please request a new one." }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({ message: "Password has been reset successfully." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
