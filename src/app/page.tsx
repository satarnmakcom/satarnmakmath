'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getProblems } from '@/actions/problems'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

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
  if (diff < 1400) return { bg: 'diff-easy', label: 'Easy', color: 'text-emerald-400' }
  if (diff < 1800) return { bg: 'diff-medium', label: 'Medium', color: 'text-gold-400' }
  if (diff < 2400) return { bg: 'diff-hard', label: 'Hard', color: 'text-rose-400' }
  return { bg: 'diff-insane', label: 'Insane', color: 'text-violet-400' }
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    const start = ref.current
    const diff = value - start
    if (diff === 0) return
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setDisplay(current)
      ref.current = current
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <>{display}</>
}

const quickActions = [
  { href: '/practice', label: 'Practice', icon: 'M13 10V3L4 14h7v7l9-11h-7z', gradient: 'from-blue-500 to-cyan-400' },
  { href: '/contests', label: 'Contests', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-violet-500 to-purple-400' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', gradient: 'from-amber-500 to-orange-400' },
  { href: '/learn', label: 'Learn', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', gradient: 'from-emerald-500 to-teal-400' },
]

const statCards = [
  { key: 'rating', label: 'RATING', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'electric', getValue: (u: any) => u?.rating || 1200, getSub: () => '+0 today' },
  { key: 'solved', label: 'SOLVED', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'neon', getValue: (u: any) => u?.solvedCount || 0, getSub: () => '0 this week' },
  { key: 'streak', label: 'STREAK', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', color: 'gold', getValue: (u: any) => u?.streak || 0, getSub: (u: any) => `Best: ${u?.streak || 0}` },
  { key: 'rank', label: 'GLOBAL RANK', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'violet', getValue: (u: any) => u?.globalRank || 0, getSub: () => 'Unranked', isRank: true },
]

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
      {/* ─── Hero Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden border border-[var(--border-color)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1b36] to-[#0f1a30]"></div>
        <div className="hero-glow bg-blue-500 top-[-200px] right-[10%]"></div>
        <div className="hero-glow bg-violet-500 bottom-[-200px] left-[5%]"></div>
        <div className="absolute inset-0 dot-pattern"></div>

        <div className="relative z-10 px-6 md:px-10 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-blue-300/60 font-medium mb-1"
              >
                Welcome back,
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
              >
                {user?.name || "Anonymous"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-blue-200/50 mt-2"
              >
                You are on a <span className="text-emerald-400 font-bold">{user?.streak || 0}-day streak</span>. Keep pushing!
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              <Link href="/practice" className="btn-primary px-6 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Start Practice
              </Link>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <Link
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon}/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="card accent-top-bar rounded-2xl p-5 relative overflow-hidden group"
          >
            <div className={`absolute top-3 right-3 w-10 h-10 rounded-xl bg-${stat.color}-500/8 flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity`}>
              <svg className={`w-5 h-5 text-${stat.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/>
              </svg>
            </div>
            <div className="relative">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.15em] font-bold mb-2">{stat.label}</div>
              <div className={`text-2xl md:text-3xl font-extrabold stat-number text-${stat.color}-400`}>
                {stat.isRank ? (
                  stat.getValue(user) ? <>#{stat.getValue(user)}</> : '—'
                ) : (
                  <AnimatedNumber value={stat.getValue(user)} />
                )}
                {stat.key === 'streak' && <span className="text-sm font-medium text-[var(--text-tertiary)] ml-1">days</span>}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1.5 font-medium">{stat.getSub(user)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Recommended Problems + Continue Learning ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        <div className="lg:col-span-2 card-static rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-electric-500 to-violet-500 block"></span>
              Recommended Problems
            </h3>
            <Link href="/practice" className="text-xs text-electric-400 hover:text-electric-300 font-bold transition-colors">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-xl border border-[var(--border-color)] p-5">
                  <div className="skeleton h-4 w-3/4 mb-3"></div>
                  <div className="skeleton h-3 w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-16"></div>
                    <div className="skeleton h-5 w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problems.map((p, i) => {
                const diff = getDiffClass(p.difficulty)
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/practice/${p.code}`} className="block rounded-xl border border-[var(--border-color)] p-5 hover:border-electric-500/30 transition-all cursor-pointer group bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono text-[var(--text-tertiary)] flex-shrink-0 font-medium">{p.code}</span>
                          <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors text-sm truncate">{p.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${diff.bg} flex-shrink-0`}>{p.level}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {p.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)] text-[10px] font-medium">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                        <span className={`font-bold ${diff.color}`}>{diff.label} • {p.difficulty}</span>
                        <span className="font-medium">{p._count.submissions} solved</span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
        <div className="card-static rounded-2xl p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-5 text-base flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 block"></span>
            Continue Learning
          </h3>
          <div className="space-y-5">
            <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)]/50">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <p className="text-[var(--text-secondary)] font-medium text-sm">Start your first curriculum module</p>
              <p className="text-[var(--text-tertiary)] text-xs mt-1">to see progress here</p>
            </div>
          </div>
          <Link href="/learn" className="w-full mt-6 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-electric-500/30 text-sm font-semibold text-[var(--text-secondary)] hover:text-electric-400 transition-all hover:bg-[var(--bg-secondary)] text-center block">
            View Curriculum →
          </Link>
        </div>
      </div>

      {/* ─── Recent Activity ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card-static rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-gold-500 to-orange-500 block"></span>
            Recent Activity
          </h3>
          <button className="text-xs text-electric-400 hover:text-electric-300 font-bold transition-colors">View All</button>
        </div>
        <div className="p-10 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)]/30">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] font-semibold text-sm">No recent activity yet</p>
          <p className="text-[var(--text-tertiary)] text-xs mt-1">Go solve some problems to see your activity here!</p>
        </div>
      </motion.div>
    </section>
  )
}
