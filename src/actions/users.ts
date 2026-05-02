"use server"

import prisma from "@/lib/prisma"
import { CompetitionLevel } from "@prisma/client"

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          orderBy: { unlockedAt: 'desc' },
          take: 5
        },
        _count: {
          select: { submissions: { where: { status: "ACCEPTED" } } }
        }
      }
    })
    
    if (!user) return { success: false, error: "User not found" }
    return { success: true, data: user }
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

export async function getLeaderboard(params?: {
  limit?: number;
  country?: string;
}) {
  try {
    const users = await prisma.user.findMany({
      where: {
        ...(params?.country && { country: params.country })
      },
      orderBy: [
        { rating: 'desc' },
        { streak: 'desc' }
      ],
      take: params?.limit || 100,
      select: {
        id: true,
        name: true,
        image: true,
        rating: true,
        country: true,
        streak: true,
        _count: {
          select: { submissions: { where: { status: "ACCEPTED" } } }
        }
      }
    })
    
    // Add rank mapping dynamically based on sorted index
    const rankedUsers = users.map((u, index) => ({
      ...u,
      solvedCount: u._count.submissions,
      rank: index + 1
    }))

    return { success: true, data: rankedUsers }
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return { success: false, error: "Failed to fetch leaderboard" }
  }
}
