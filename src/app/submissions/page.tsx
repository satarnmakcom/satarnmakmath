import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserSubmissions } from "@/actions/submissions"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Submissions' }

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
      +0
    </span>
  )
}

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const res = await getUserSubmissions(session.user.id)
  const submissions = res.data || []
  const hasPending = submissions.some((s: any) => s.status === 'PENDING')

  const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
    PENDING:     { label: 'Evaluating', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400 animate-pulse' },
    ACCEPTED:    { label: 'Accepted',   className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    WRONG_ANSWER:{ label: 'Wrong',      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">My Submissions</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/practice" className="px-4 py-2 bg-electric-500/10 text-electric-400 rounded-xl hover:bg-electric-500/20 transition-colors text-sm font-semibold border border-electric-500/20">
          ← Practice
        </Link>
      </div>

      {/* Pending notice */}
      {hasPending && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-sm text-orange-400">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
          <span>AI is still grading some submissions. This page refreshes automatically every 5 seconds.</span>
        </div>
      )}

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
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-semibold text-[var(--text-secondary)]">No submissions yet</p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                      <Link href="/practice" className="text-electric-400 hover:underline">Go solve some problems!</Link>
                    </p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => {
                  const cfg = statusConfig[sub.status] ?? statusConfig.PENDING
                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg-secondary)]/40 transition-colors group">
                      <td className="px-5 py-4">
                        <Link href={`/practice/${sub.problemId}`} className="group/link">
                          <span className="text-xs font-bold text-electric-500 bg-electric-500/10 px-2 py-0.5 rounded-md mr-2">{sub.problem.code}</span>
                          <span className="font-semibold text-[var(--text-primary)] group-hover/link:text-electric-400 transition-colors text-sm">{sub.problem.title}</span>
                        </Link>
                        {/* AI Feedback tooltip */}
                        {sub.feedback && sub.status !== 'PENDING' && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-1 italic">
                            💬 {sub.feedback}
                          </p>
                        )}
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
                          <RatingBadge delta={sub.ratingDelta} />
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

      {hasPending && (
        <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => window.location.reload(), 5000)` }} />
      )}
    </div>
  )
}
