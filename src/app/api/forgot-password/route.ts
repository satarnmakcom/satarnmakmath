import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success (don't leak whether email exists)
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour expiry

    // Store the token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // TODO: Replace with actual email service (Resend, SendGrid, etc.)
    console.log("═══════════════════════════════════════════")
    console.log("📧 PASSWORD RESET LINK (send to user):")
    console.log(resetUrl)
    console.log("═══════════════════════════════════════════")

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
