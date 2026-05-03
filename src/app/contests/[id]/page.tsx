import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ContestClient from "./ContestClient"

export default async function ContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const problemSet = await prisma.problemSet.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!problemSet || (!problemSet.isPublic && session?.user?.role !== "ADMIN")) {
    notFound()
  }

  // Get active attempt if exists
  let attempt = null
  if (session?.user?.id) {
    attempt = await prisma.problemSetAttempt.findFirst({
      where: {
        userId: session.user.id,
        problemSetId: id
      },
      orderBy: { startedAt: "desc" },
      include: {
        submissions: true
      }
    })
  }

  return <ContestClient problemSet={problemSet as any} attempt={attempt as any} session={session} />
}
