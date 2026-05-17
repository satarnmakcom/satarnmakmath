import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, password, otp } = body

    if (!email || !name || !password || !otp) {
      return NextResponse.json({ error: "Missing required fields (including OTP)" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password should be at least 6 characters" }, { status: 400 })
    }

    // Verify OTP
    const verification = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    })

    if (!verification) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 })
    }

    if (verification.expires < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // Mark email as verified since they used OTP
      }
    })

    // Delete used OTP
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        id: user.id
      }
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
