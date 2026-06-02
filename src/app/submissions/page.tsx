import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getUserSubmissions } from "@/actions/submissions"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const res = await getUserSubmissions(session.user.id)
  const submissions = res.data || []

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-heading text-[var(--text-primary)]">My Submissions</h1>
        <Link href="/practice" className="px-4 py-2 bg-electric-500/10 text-electric-500 rounded-lg hover:bg-electric-500/20 transition-colors text-sm font-semibold">
          Back to Practice
        </Link>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                <th className="p-4">Time</th>
                <th className="p-4">Problem</th>
                <th className="p-4">Level</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)]">
                    No submissions yet. Go solve some problems!
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => {
                  const isEvaluating = sub.status === "PENDING"
                  const isAccepted = sub.status === "ACCEPTED"
                  
                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                      <td className="p-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Link href={`/practice/${sub.problemId}`} className="font-semibold text-electric-400 hover:text-electric-300">
                          {sub.problem.code} - {sub.problem.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
                          {sub.problem.level}
                        </span>
                      </td>
                      <td className="p-4">
                        {isEvaluating ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                            Evaluating
                          </span>
                        ) : isAccepted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            ✓ Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                            ✗ Wrong Answer
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Auto refresh script for PENDING items */}
      {submissions.some((s: any) => s.status === 'PENDING') && (
        <RefreshInterval />
      )}
    </div>
  )
}

function RefreshInterval() {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `setTimeout(() => window.location.reload(), 5000);`
    }} />
  )
}
