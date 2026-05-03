"use server"

import prisma from "@/lib/prisma"

export async function getCurriculum() {
  try {
    const modules = await prisma.curriculumModule.findMany({
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' }
      ]
    })
    
    return { success: true, data: modules }
  } catch (error) {
    console.error("Failed to fetch curriculum:", error)
    return { success: false, error: "Failed to fetch curriculum" }
  }
}
