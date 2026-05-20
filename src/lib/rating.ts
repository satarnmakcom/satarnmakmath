/**
 * ELO-like rating calculation for Math Olympiad problems.
 * 
 * When a user solves a problem:
 * - If the problem is HARDER than their rating → bigger gain
 * - If the problem is EASIER than their rating → smaller gain
 * 
 * When a user fails a problem:
 * - Small penalty regardless (to discourage spam submissions)
 */

export function calculateRatingChange(
  userRating: number,
  problemDifficulty: number,
  isCorrect: boolean
): number {
  // Dynamic K-factor based on rating (higher rating = slower growth)
  let kFactor = 30
  if (userRating > 1400) kFactor = 20
  if (userRating > 1800) kFactor = 10
  if (userRating > 2200) kFactor = 5

  // Expected score using logistic function (like chess ELO)
  const expectedScore = 1 / (1 + Math.pow(10, (problemDifficulty - userRating) / 400))

  if (isCorrect) {
    // Gain: K * (1 - expectedScore)
    // Harder problems (low expectedScore) → bigger gain
    const gain = Math.round(kFactor * (1 - expectedScore))
    return Math.max(1, gain) // Always gain at least 1 point
  } else {
    // Loss: small penalty, capped
    const loss = Math.round(kFactor * expectedScore * 0.3) // 30% of what you'd gain
    return -Math.max(1, loss) // Always lose at least 1 point
  }
}

/**
 * Recalculate global ranks for all users.
 * Called after any rating change.
 */
export async function recalculateGlobalRanks(prisma: any) {
  const users = await prisma.user.findMany({
    orderBy: { rating: 'desc' },
    select: { id: true }
  })

  // Batch update ranks
  const updates = users.map((user: { id: string }, index: number) =>
    prisma.user.update({
      where: { id: user.id },
      data: { globalRank: index + 1 }
    })
  )

  await Promise.all(updates)
}

export const getRatingInfo = (rating: number) => {
  if (rating < 1200) return { title: 'Newbie', className: 'rating-newbie' }
  if (rating < 1400) return { title: 'Pupil', className: 'rating-pupil' }
  if (rating < 1600) return { title: 'Specialist', className: 'rating-specialist' }
  if (rating < 1900) return { title: 'Expert', className: 'rating-expert' }
  if (rating < 2100) return { title: 'Candidate Master', className: 'text-[#a0a]' }
  if (rating < 2300) return { title: 'Master', className: 'rating-master' }
  if (rating < 2400) return { title: 'International Master', className: 'text-[#ff8c00]' }
  if (rating < 2600) return { title: 'Grandmaster', className: 'rating-grandmaster' }
  if (rating < 3000) return { title: 'International Grandmaster', className: 'text-[#f00] font-bold' }
  if (rating < 4000) return { title: 'Legendary Grandmaster', className: 'text-[#f00] font-extrabold drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' }
  return { title: 'Supreme', className: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 font-black drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]' }
}

export const getRankProgress = (rating: number) => {
  if (rating < 1200) return { current: 'Newbie', next: 'Pupil', percent: Math.max(0, (rating / 1200) * 100) }
  if (rating < 1400) return { current: 'Pupil', next: 'Specialist', percent: Math.max(0, ((rating - 1200) / 200) * 100) }
  if (rating < 1600) return { current: 'Specialist', next: 'Expert', percent: Math.max(0, ((rating - 1400) / 200) * 100) }
  if (rating < 1900) return { current: 'Expert', next: 'Candidate Master', percent: Math.max(0, ((rating - 1600) / 300) * 100) }
  if (rating < 2100) return { current: 'Candidate Master', next: 'Master', percent: Math.max(0, ((rating - 1900) / 200) * 100) }
  if (rating < 2300) return { current: 'Master', next: 'Int. Master', percent: Math.max(0, ((rating - 2100) / 200) * 100) }
  if (rating < 2400) return { current: 'Int. Master', next: 'Grandmaster', percent: Math.max(0, ((rating - 2300) / 100) * 100) }
  if (rating < 2600) return { current: 'Grandmaster', next: 'Int. Grandmaster', percent: Math.max(0, ((rating - 2400) / 200) * 100) }
  if (rating < 3000) return { current: 'Int. Grandmaster', next: 'Leg. Grandmaster', percent: Math.max(0, ((rating - 2600) / 400) * 100) }
  if (rating < 4000) return { current: 'Leg. Grandmaster', next: 'Supreme', percent: Math.max(0, ((rating - 3000) / 1000) * 100) }
  return { current: 'Supreme', next: 'Max', percent: 100 }
}
