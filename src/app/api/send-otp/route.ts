import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 })
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. Store OTP in database (upsert to handle re-sends)
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // delete existing OTP for this email if it exists
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires
      }
    })

    // 4. Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use Gmail App Password, not regular password
      },
    })

    const mailOptions = {
      from: `"SatarnMath" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SatarnMath Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Welcome to SatarnMath!</h2>
          <p>Please use the following verification code to complete your registration.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    }

    // Attempt to send, if credentials are not configured it will fail gracefully
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions)
      return NextResponse.json({ success: true, message: "OTP sent to your email!" })
    } else {
      // Fallback for development if .env is not setup
      console.log(`\n==========================================`)
      console.log(`[MOCK EMAIL] To: ${email}`)
      console.log(`[MOCK EMAIL] OTP: ${otp}`)
      console.log(`==========================================\n`)
      return NextResponse.json({ success: true, message: "Email not configured. OTP printed in server console for testing." })
    }
  } catch (error: any) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
  }
}
