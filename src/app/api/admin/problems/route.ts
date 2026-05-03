import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      title: true,
      level: true,
      difficulty: true,
    }
  })

  return NextResponse.json(problems)
}
