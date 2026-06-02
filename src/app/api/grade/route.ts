import { NextResponse } from 'next/server'
import { aiGradeSolution } from '@/actions/grading'

export const maxDuration = 60 // Allow function to run up to 60s on Vercel

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { submissionId, userId, problemId, studentProof } = data

    if (!submissionId || !userId || !problemId || !studentProof) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Await the grading so Vercel doesn't kill the function before it finishes
    const result = await aiGradeSolution({ submissionId, userId, problemId, studentProof })

    return NextResponse.json({ success: true, message: 'Grading completed', result }, { status: 200 })
  } catch (error: any) {
    console.error('API /grade error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
