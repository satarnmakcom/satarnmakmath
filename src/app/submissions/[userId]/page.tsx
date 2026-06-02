import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { name: decodeURIComponent(userId) }] } })
  return { title: user ? `${user.name}'s Submissions` : 'Submissions' }
}

function RatingBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === undefined) {
    return <span className="text-xs text-[var(--text-tertiary)]">—</span>
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-bold text-emerald-400 text-sm">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 17a1 1 0 01-1-1V6.414l-3.293 3.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
        </svg>
        +{delta}
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-bold text-rose-400 text-sm">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l3.293-3.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        {delta}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-bold text-[var(--text-tertiary)] text-sm">
      <span className="text-base leading-none">–</span>0
    </span>
  )
}

export default async function UserSubmissionsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await prisma.user.findFirst({
    where: { OR: [{ id: userId }, { name: decodeURIComponent(userId) }] },
    select: { id: true, name: true, image: true }
  })

  if (!user) notFound()

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: 'desc' },
    include: {
      problem: { select: { id: true, code: true, title: true, level: true } }
    }
  })

  const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
    PENDING:     { label: 'Evaluating', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400 animate-pulse' },
    ACCEPTED:    { label: 'Accepted',   className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    WRONG_ANSWER:{ label: 'Wrong',      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
  }

  const accepted = submissions.filter(s => s.status === 'ACCEPTED').length

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <img
          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          className="w-12 h-12 rounded-xl object-cover border-2 border-[var(--border-color)]"
          alt=""
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{user.name}'s Submissions</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {accepted} solved · {submissions.length} total
          </p>
        </div>
        <Link href={`/user/${encodeURIComponent(user.name || user.id)}`} className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:border-electric-500/30 transition-colors text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          ← Profile
        </Link>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/60 border-b border-[var(--border-color)]">
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Problem</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Level</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest text-center">Rating</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="text-4xl mb-3">😴</div>
                    <p className="font-semibold text-[var(--text-secondary)]">No submissions yet</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const cfg = statusConfig[sub.status] ?? statusConfig.PENDING
                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg-secondary)]/40 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/practice/${sub.problemId}`} className="group">
                          <span className="text-xs font-bold text-electric-500 bg-electric-500/10 px-2 py-0.5 rounded-md mr-2">{sub.problem.code}</span>
                          <span className="font-semibold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors text-sm">{sub.problem.title}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
                          {sub.problem.level}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {sub.status === 'PENDING' ? (
                          <span className="text-xs text-[var(--text-tertiary)]">…</span>
                        ) : (
                          <RatingBadge delta={(sub as any).ratingDelta} />
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
