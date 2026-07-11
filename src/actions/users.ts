"use server"

import prisma from "@/lib/prisma"
import { CompetitionLevel } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function adminUpdateRating(userId: string, newRating: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admins only" }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { rating: newRating }
    })

    revalidatePath(`/user/${userId}`)
    revalidatePath(`/profile`)
    revalidatePath(`/leaderboard`)

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error("Failed to update rating:", error)
    return { success: false, error: "Failed to update rating" }
  }
}

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

const CONTINENT_MAP: Record<string, string[]> = {
  'Asia': ['TH', 'JP', 'CN', 'IN', 'VN', 'SG', 'KR', 'MY', 'ID', 'PH', 'TW', 'HK'],
  'Europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'RU', 'NL', 'SE', 'CH', 'PL', 'UA'],
  'North America': ['US', 'CA', 'MX'],
  'South America': ['BR', 'AR', 'CO', 'CL', 'PE'],
  'Oceania': ['AU', 'NZ'],
  'Africa': ['ZA', 'EG', 'NG', 'KE', 'MA']
};

export async function getLeaderboard(params?: {
  limit?: number;
  country?: string;
  continent?: string;
}) {
  try {
    let countryFilter = params?.country ? { country: params.country } : undefined;
    
    if (!params?.country && params?.continent && CONTINENT_MAP[params.continent]) {
      countryFilter = { country: { in: CONTINENT_MAP[params.continent] } };
    }

    const users = await prisma.user.findMany({
      where: {
        ...countryFilter
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

export async function getCountryStats() {
  try {
    const stats = await prisma.user.groupBy({
      by: ['country'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })
    
    const formattedStats = stats.map(s => ({
      country: s.country || 'Unknown',
      count: s._count.id
    })).filter(s => s.country !== 'Unknown')

    return { success: true, data: formattedStats }
  } catch (error) {
    console.error("Failed to fetch country stats:", error)
    return { success: false, error: "Failed to fetch country stats" }
  }
}
