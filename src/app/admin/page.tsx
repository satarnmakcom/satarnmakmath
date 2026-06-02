import prisma from "@/lib/prisma"
import Link from "next/link"
import { Suspense } from "react"

export const revalidate = 60 // cache for 60 seconds

export default async function AdminDashboardPage() {
  const [
    userCount,
    problemCount,
    submissionCount,
    recentSubmissions,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.problem.count(),
    prisma.submission.count(),
    prisma.submission.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { name: true, image: true, id: true } },
        problem: { select: { code: true, title: true } }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, image: true, createdAt: true, rating: true, role: true, isBanned: true }
    })
  ])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Dashboard Overview</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm font-medium">Welcome to the Saturnmath admin console.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-electric-500/10 rounded-full blur-2xl group-hover:bg-electric-500/20 transition-colors"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] mt-2">{userCount.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-electric-500/10 text-electric-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            Growing community
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Total Problems</p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] mt-2">{problemCount.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-[var(--text-secondary)]">
            Ready to be solved
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Submissions</p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] mt-2">{submissionCount.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-[var(--text-secondary)]">
            Total activity
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Recent Submissions</h2>
          </div>
          <div className="p-0 divide-y divide-[var(--border-color)] flex-1">
            {recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-tertiary)] text-sm">No submissions yet</div>
            ) : (
              recentSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={sub.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.user.name}`} 
                      className="w-10 h-10 rounded-full border border-[var(--border-color)] object-cover"
                      alt="" 
                    />
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {sub.user.name} <span className="font-normal text-[var(--text-secondary)]">submitted</span> {sub.problem.code}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    {sub.status === "ACCEPTED" ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">ACCEPTED</span>
                    ) : sub.status === "WRONG_ANSWER" ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">WRONG</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">PENDING</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Newest Users */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/50">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Newest Users</h2>
            <Link href="/admin/users" className="text-xs font-bold text-electric-500 hover:text-electric-400">View All →</Link>
          </div>
          <div className="p-0 divide-y divide-[var(--border-color)] flex-1">
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-tertiary)] text-sm">No users yet</div>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} 
                      className="w-10 h-10 rounded-full border border-[var(--border-color)] object-cover"
                      alt="" 
                    />
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {u.name} {u.role === "ADMIN" && <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-electric-500 text-white uppercase tracking-wider">Admin</span>}
                        {u.isBanned && <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white uppercase tracking-wider">Banned</span>}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{u.rating}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Rating</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
