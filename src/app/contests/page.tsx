import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function ContestsPage() {
  const sets = await prisma.problemSet.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } }
    }
  })

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Contests & Mock Exams</h1>
      <p className="text-[var(--text-secondary)] mb-8">Test your skills under timed conditions. Your solutions will be automatically graded by AI.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sets.map(set => (
          <Link key={set.id} href={`/contests/${set.id}`} className="card p-6 rounded-2xl border border-[var(--border-color)] hover:border-electric-500/50 hover:shadow-xl hover:shadow-electric-500/5 transition-all group block">
            <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors mb-2">{set.title}</h3>
            {set.description && (
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">{set.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-auto border-t border-[var(--border-color)] pt-4">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {set.timeLimitMinutes} mins
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                {set._count.items} Problems
              </div>
            </div>
          </Link>
        ))}

        {sets.length === 0 && (
          <div className="col-span-full text-center py-16 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)]">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-bold">No active contests</h3>
            <p>Check back later for upcoming mock exams.</p>
          </div>
        )}
      </div>
    </div>
  )
}
