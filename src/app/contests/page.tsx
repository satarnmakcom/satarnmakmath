import prisma from "@/lib/prisma"
import ContestsClient from "./ContestsClient"

export default async function ContestsPage() {
  const sets = await prisma.problemSet.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } }
    }
  })

  return <ContestsClient sets={sets} />
}
