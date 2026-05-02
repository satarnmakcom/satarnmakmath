import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, password } = body

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password should be at least 6 characters" }, { status: 400 })
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
      }
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
