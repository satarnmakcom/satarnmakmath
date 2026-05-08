'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard } from '@/actions/users'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface User {
  id: string
  name: string | null
  image: string | null
  country: string
  rating: number
  solvedCount: number
  rank: number
}

const getRatingClass = (rating: number) => {
  if (rating >= 2600) return 'rating-grandmaster'
  if (rating >= 2200) return 'rating-master'
  if (rating >= 1800) return 'rating-expert'
  if (rating >= 1400) return 'rating-specialist'
  if (rating >= 1000) return 'rating-pupil'
  return 'rating-newbie'
}

const getRatingTitle = (rating: number) => {
  if (rating >= 2600) return 'Grandmaster'
  if (rating >= 2200) return 'Master'
  if (rating >= 1800) return 'Expert'
  if (rating >= 1400) return 'Specialist'
  if (rating >= 1000) return 'Pupil'
  return 'Newbie'
}

const medalIcons = ['🥇', '🥈', '🥉']
const podiumColors = ['podium-gold', 'podium-silver', 'podium-bronze']
const podiumGradients = [
  'from-yellow-500/10 to-amber-500/5',
  'from-slate-400/10 to-slate-500/5',
  'from-orange-500/10 to-amber-600/5'
]

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getLeaderboard({ limit: 20 })
      if (res.success) setUsers(res.data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <section className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* ─── Hero Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-[var(--border-color)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1b36] to-[#0f1a30]"></div>
        <div className="hero-glow bg-amber-500 top-[-200px] right-[15%]"></div>
        <div className="hero-glow bg-violet-500 bottom-[-200px] left-[10%]"></div>
        <div className="absolute inset-0 dot-pattern"></div>

        <div className="relative z-10 px-6 md:px-10 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold tracking-wider uppercase mb-3 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Live Rankings
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Global Leaderboard</h1>
              <p className="text-sm text-blue-200/50 mt-2">Real-time rankings of competitive mathematicians</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white/70 outline-none cursor-pointer hover:bg-white/[0.1] transition-colors">
                <option>All Regions</option>
                <option>Thailand</option>
                <option>Asia</option>
              </select>
              <select className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white/70 outline-none cursor-pointer hover:bg-white/[0.1] transition-colors">
                <option>All Levels</option>
                <option>สอวน. ค่าย 1</option>
                <option>TMO</option>
                <option>IMO</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Top 3 Podium ─── */}
      {!loading && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6"
          >
            <PodiumCard user={top3[1]} rank={2} />
          </motion.div>
          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PodiumCard user={top3[0]} rank={1} />
          </motion.div>
          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <PodiumCard user={top3[2]} rank={3} />
          </motion.div>
        </div>
      )}

      {/* ─── Leaderboard Table ─── */}
      <div className="card-static rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] data-table">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">Rank</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">User</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">Country</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">Rating</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">Solved</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.15em]">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-8"></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="skeleton w-8 h-8 rounded-full"></div><div className="skeleton h-4 w-24"></div></div></td>
                    <td className="px-6 py-4"><div className="skeleton h-5 w-8"></div></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-12"></div></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-8"></div></td>
                    <td className="px-6 py-4"><div className="skeleton h-4 w-4"></div></td>
                  </tr>
                ))
              ) : (
                users.map((u, index) => {
                  const trends = ['up', 'down', 'same']
                  const trend = trends[index % 3]
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-[var(--bg-secondary)] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className={`font-bold text-sm ${u.rank <= 3 ? 'text-gold-400' : 'text-[var(--text-primary)]'}`}>
                          {u.rank <= 3 ? medalIcons[u.rank - 1] : `#${u.rank || index + 1}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/user/${encodeURIComponent(u.name || u.id)}`} className="flex items-center gap-3 group/user">
                          <img src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] object-cover ring-2 ring-transparent group-hover/user:ring-electric-500/30 transition-all" alt="" />
                          <div>
                            <span className={`font-semibold text-sm ${getRatingClass(u.rating)} group-hover/user:underline`}>{u.name}</span>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-medium">{getRatingTitle(u.rating)}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-lg">{u.country}</td>
                      <td className={`px-6 py-4 font-bold text-sm stat-number ${getRatingClass(u.rating)}`}>{u.rating}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] text-sm font-medium">{u.solvedCount}</td>
                      <td className="px-6 py-4">
                        {trend === 'up' && <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-md">▲</span>}
                        {trend === 'down' && <span className="text-rose-400 font-bold text-xs bg-rose-500/10 px-2 py-0.5 rounded-md">▼</span>}
                        {trend === 'same' && <span className="text-[var(--text-tertiary)] text-xs">−</span>}
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function PodiumCard({ user, rank }: { user: User; rank: number }) {
  const medal = medalIcons[rank - 1]
  const podiumClass = podiumColors[rank - 1]
  const gradient = podiumGradients[rank - 1]

  return (
    <Link href={`/user/${encodeURIComponent(user.name || user.id)}`} className="block">
      <div className={`podium-card ${podiumClass} rounded-2xl p-5 text-center hover:scale-[1.02] transition-all cursor-pointer bg-gradient-to-b ${gradient}`}>
        <div className="text-2xl mb-2">{medal}</div>
        <img
          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          className={`w-14 h-14 rounded-full mx-auto bg-[var(--bg-secondary)] object-cover ring-2 ${rank === 1 ? 'ring-amber-400/50 w-16 h-16' : rank === 2 ? 'ring-slate-400/50' : 'ring-orange-400/50'}`}
          alt=""
        />
        <div className={`font-bold text-sm mt-3 truncate ${getRatingClass(user.rating)}`}>{user.name}</div>
        <div className="text-xs text-[var(--text-tertiary)] font-medium">{getRatingTitle(user.rating)}</div>
        <div className={`text-lg font-extrabold stat-number mt-1 ${getRatingClass(user.rating)}`}>{user.rating}</div>
        <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{user.solvedCount} solved</div>
      </div>
    </Link>
  )
}
