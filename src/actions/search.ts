"use server"

import prisma from "@/lib/prisma"

export interface SearchResult {
  id: string
  type: 'problem' | 'module' | 'lesson' | 'user'
  title: string
  subtitle: string
  href: string
  meta?: string
}

export async function globalSearch(query: string): Promise<{ success: boolean; data?: SearchResult[] }> {
  if (!query || query.trim().length < 2) {
    return { success: true, data: [] }
  }

  const q = query.trim()

  try {
    // Search in parallel
    const [problems, modules, lessons, users] = await Promise.all([
      // Problems
      prisma.problem.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { code: { contains: q, mode: 'insensitive' } },
            { tags: { hasSome: [q] } },
          ]
        },
        take: 5,
        orderBy: { difficulty: 'asc' },
        select: { id: true, code: true, title: true, level: true, difficulty: true, tags: true }
      }),
      // Curriculum Modules
      prisma.curriculumModule.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 3,
        select: { id: true, title: true, level: true, description: true }
      }),
      // Lessons
      prisma.lesson.findMany({
        where: {
          title: { contains: q, mode: 'insensitive' }
        },
        take: 3,
        include: { module: { select: { id: true, title: true } } },
        orderBy: { order: 'asc' }
      }),
      // Users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 3,
        select: { id: true, name: true, rating: true, image: true }
      }),
    ])

    const results: SearchResult[] = []

    // Map problems
    for (const p of problems) {
      results.push({
        id: p.id,
        type: 'problem',
        title: p.title,
        subtitle: `${p.code} · ${p.level}`,
        href: `/practice/${p.code}`,
        meta: `${p.difficulty} rating`,
      })
    }

    // Map modules
    for (const m of modules) {
      results.push({
        id: m.id,
        type: 'module',
        title: m.title,
        subtitle: m.level,
        href: `/learn/${m.id}`,
        meta: m.description?.slice(0, 60) || undefined,
      })
    }

    // Map lessons
    for (const l of lessons) {
      results.push({
        id: l.id,
        type: 'lesson',
        title: l.title,
        subtitle: l.module.title,
        href: `/learn/${l.module.id}`,
        meta: 'Lesson',
      })
    }

    // Map users
    for (const u of users) {
      results.push({
        id: u.id,
        type: 'user',
        title: u.name || 'Anonymous',
        subtitle: `Rating: ${u.rating}`,
        href: `/user/${encodeURIComponent(u.name || u.id)}`,
      })
    }

    return { success: true, data: results }
  } catch (error) {
    console.error("Search failed:", error)
    return { success: false, data: [] }
  }
}
