'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard } from '@/actions/users'

interface User {
  id: string
  name: string | null
  country: string
  rating: number
  solvedCount: number
  rank: number
}

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

  const getRatingClass = (rating: number) => {
    if (rating >= 2600) return 'rating-grandmaster'
    if (rating >= 2200) return 'rating-master'
    if (rating >= 1800) return 'rating-expert'
    if (rating >= 1400) return 'rating-specialist'
    if (rating >= 1000) return 'rating-pupil'
    return 'rating-newbie'
  }

  return (
    <section className="max-w-5xl mx-auto space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Global Leaderboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Real-time rankings of competitive mathematicians</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-electric-500/50 cursor-pointer hover:border-electric-500/30 transition-colors">
            <option>All Regions</option>
            <option>Thailand</option>
            <option>Asia</option>
            <option>Europe</option>
          </select>
          <select className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-electric-500/50 cursor-pointer hover:border-electric-500/30 transition-colors">
            <option>All Levels</option>
            <option>สอวน. ค่าย 1</option>
            <option>TMO</option>
            <option>IMO</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] data-table">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Country</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Solved</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500 mx-auto"></div>
                  </td>
                </tr>
              ) : (
                users.map((u, index) => {
                  const trends = ['up', 'down', 'same']
                  const trend = trends[index % 3]
                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className={`px-6 py-4 font-bold ${u.rank <= 3 ? 'text-gold-400' : 'text-[var(--text-primary)]'}`}>#{u.rank || index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)]" alt="" />
                          <span className={`font-semibold text-sm ${getRatingClass(u.rating)}`}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-lg">{u.country}</td>
                      <td className={`px-6 py-4 font-bold text-sm ${getRatingClass(u.rating)}`}>{u.rating}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">{u.solvedCount}</td>
                      <td className="px-6 py-4">
                        {trend === 'up' && <span className="text-neon-400 font-bold">▲</span>}
                        {trend === 'down' && <span className="text-rose-400 font-bold">▼</span>}
                        {trend === 'same' && <span className="text-[var(--text-tertiary)]">−</span>}
                      </td>
                    </tr>
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
