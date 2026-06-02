import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { aiGradeSolution } from '@/actions/grading'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { submissionId, userId, problemId, studentProof } = data

    if (!submissionId || !userId || !problemId || !studentProof) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Attempt to use 'after' for Vercel background tasks, fallback to un-awaited promise
    if (typeof after === 'function') {
      after(() => {
        aiGradeSolution({ submissionId, userId, problemId, studentProof }).catch(console.error)
      })
    } else {
      // Run asynchronously without awaiting
      aiGradeSolution({ submissionId, userId, problemId, studentProof }).catch(console.error)
    }

    // Return immediately to the client
    return NextResponse.json({ success: true, message: 'Grading started in background' }, { status: 202 })
  } catch (error: any) {
    console.error('API /grade error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
