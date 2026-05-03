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

const K_FACTOR = 40 // Maximum possible rating change per problem

export function calculateRatingChange(
  userRating: number,
  problemDifficulty: number,
  isCorrect: boolean
): number {
  // Expected score using logistic function (like chess ELO)
  const expectedScore = 1 / (1 + Math.pow(10, (problemDifficulty - userRating) / 400))

  if (isCorrect) {
    // Gain: K * (1 - expectedScore)
    // Harder problems (low expectedScore) → bigger gain
    const gain = Math.round(K_FACTOR * (1 - expectedScore))
    return Math.max(1, gain) // Always gain at least 1 point
  } else {
    // Loss: small penalty, capped
    const loss = Math.round(K_FACTOR * expectedScore * 0.3) // 30% of what you'd gain
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
