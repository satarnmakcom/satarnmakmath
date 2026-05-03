'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProblems } from '@/actions/problems'
import { useSession } from 'next-auth/react'

interface Problem {
  id: string
  code: string
  title: string
  level: string
  difficulty: number
  tags: string[]
  _count: { submissions: number }
}

function getDiffClass(diff: number) {
  if (diff < 1400) return 'diff-easy'
  if (diff < 1800) return 'diff-medium'
  if (diff < 2400) return 'diff-hard'
  return 'diff-insane'
}

export default function DashboardPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const user = session?.user

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getProblems({ limit: 4 })
      if (res.success) setProblems(res.data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <section className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-1 font-medium">Welcome back,</p>
          <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">{user?.name || "Anonymous"}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">You are on a <span className="text-neon-400 font-bold">{user?.streak || 0}-day streak</span>. Keep pushing!</p>
        </div>
        <div className="flex gap-3">
          <Link href="/practice" className="btn-primary px-6 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span>Practice</span>
          </Link>
          <Link href="/leaderboard" className="btn-secondary px-5 py-2.5 text-[var(--text-primary)] rounded-xl text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-electric-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-electric-500/10 transition-all duration-500"></div>
          <div className="relative">
            <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-2">Rating</div>
            <div className="text-2xl md:text-3xl font-extrabold text-electric-400 tracking-tight group-hover:text-electric-300 transition-colors">{user?.rating || 1200}</div>
            <div className="text-xs text-neon-400 mt-1.5 flex items-center gap-1 font-bold bg-neon-500/10 w-fit px-2 py-0.5 rounded-lg">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
              +0
            </div>
          </div>
        </div>
        <div className="card rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-500/10 transition-all duration-500"></div>
          <div className="relative">
            <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-2">Solved</div>
            <div className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{user?.solvedCount || 0}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1.5 font-medium">0 this month</div>
          </div>
        </div>
        <div className="card rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-500/10 transition-all duration-500"></div>
          <div className="relative">
            <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-2">Streak</div>
            <div className="text-2xl md:text-3xl font-extrabold text-gold-400 tracking-tight">{user?.streak || 0} <span className="text-sm font-medium text-[var(--text-secondary)]">days</span></div>
            <div className="text-xs text-[var(--text-secondary)] mt-1.5 font-medium">Best: {user?.streak || 0}</div>
          </div>
        </div>
        <div className="card rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/10 transition-all duration-500"></div>
          <div className="relative">
            <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-2">Global Rank</div>
            <div className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{user?.globalRank ? `#${user.globalRank}` : '-'}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1.5 flex items-center gap-1 font-bold bg-[var(--bg-secondary)] w-fit px-2 py-0.5 rounded-lg">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14"/>
              </svg>
              Unranked
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning & Rating Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        <div className="lg:col-span-2 card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[var(--text-primary)] text-base">Recommended Problems</h3>
            <select className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none cursor-pointer hover:border-electric-500/40 transition-colors">
              <option>All Difficulties</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map((p) => (
                <Link key={p.id} href={`/practice/${p.id}`} className="card rounded-xl p-5 hover:border-electric-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-[var(--text-tertiary)] flex-shrink-0 font-medium">{p.code}</span>
                      <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors text-sm truncate">{p.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getDiffClass(p.difficulty)}`}>{p.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="font-mono">{p.difficulty} rating</span>
                    <span>{p._count.submissions} solved</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card rounded-2xl p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-5 text-base">Continue Learning</h3>
          <div className="space-y-5">
            <div className="group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors">Geometry — Cyclic Quads</span>
                <span className="text-xs font-bold text-[var(--text-tertiary)]">65%</span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-electric-500 to-electric-400 rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-violet-400 transition-colors">Number Theory — Modulo</span>
                <span className="text-xs font-bold text-[var(--text-tertiary)]">42%</span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-1000" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-neon-400 transition-colors">Combinatorics — Graphs</span>
                <span className="text-xs font-bold text-[var(--text-tertiary)]">12%</span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-500 to-neon-400 rounded-full transition-all duration-1000" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
          <Link href="/learn" className="w-full mt-6 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-electric-500/40 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)] text-center block">
            View Curriculum
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[var(--text-primary)] text-base">Recent Activity</h3>
          <button className="text-xs text-electric-400 hover:text-electric-500 font-bold transition-colors">View All</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-neon-500/10 flex items-center justify-center text-neon-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">Solved <span className="text-electric-400">TMO 2565 P4</span></div>
              <div className="text-xs text-[var(--text-tertiary)]">Geometry • 2 hours ago</div>
            </div>
            <span className="text-sm font-bold text-neon-400 flex-shrink-0 bg-neon-500/10 px-2 py-0.5 rounded-lg">+18</span>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-electric-500/10 flex items-center justify-center text-electric-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">Completed <span className="text-electric-400">Cyclic Quadrilaterals</span></div>
              <div className="text-xs text-[var(--text-tertiary)]">Module • 5 hours ago</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">Rank <span className="text-gold-400">#42</span> in Weekly Challenge</div>
              <div className="text-xs text-[var(--text-tertiary)]">Challenge • 1 day ago</div>
            </div>
            <span className="text-sm font-bold text-gold-400 flex-shrink-0 bg-gold-500/10 px-2 py-0.5 rounded-lg">+45</span>
          </div>
        </div>
      </div>
    </section>
  )
}

