'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProblems } from '@/actions/problems'

interface Problem {
  id: string
  code: string
  title: string
  level: string
  difficulty: number
  tags: string[]
  acceptance?: number
  _count: { submissions: number }
}

function getDiffClass(diff: number) {
  if (diff < 1400) return { class: 'diff-easy', label: 'EASY' }
  if (diff < 1800) return { class: 'diff-medium', label: 'MEDIUM' }
  if (diff < 2400) return { class: 'diff-hard', label: 'HARD' }
  return { class: 'diff-insane', label: 'INSANE' }
}

const tags = ['Functional Eq', 'Inequality', 'Geometry', 'Number Theory', 'Combinatorics', 'Graph Theory']

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getProblems({ limit: 20 })
      if (res.success) {
        // Add mock acceptance rate for display
        const data = (res.data || []).map((p: Problem) => ({
          ...p,
          acceptance: Math.floor(Math.random() * 60) + 20
        }))
        setProblems(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <section className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-5 md:gap-6">
        {/* Sidebar Filters */}
        <div className="lg:w-56 xl:w-64 flex-shrink-0">
          <div className="card rounded-2xl p-5 lg:sticky lg:top-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Filters</h3>
              <button className="text-xs text-electric-400 hover:text-electric-500 font-bold transition-colors">Reset</button>
            </div>
            <div className="space-y-5">
              {/* Level Filter */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 block">Level</label>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="rounded border-[var(--border-color)] text-electric-500 bg-[var(--bg-secondary)] w-4 h-4 cursor-pointer focus:ring-electric-500/50"/>
                    <span className="text-sm text-[var(--text-primary)] group-hover:text-electric-400 transition-colors">สอวน. ค่าย 1</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked className="rounded border-[var(--border-color)] text-electric-500 bg-[var(--bg-secondary)] w-4 h-4 cursor-pointer focus:ring-electric-500/50"/>
                    <span className="text-sm text-[var(--text-primary)] group-hover:text-electric-400 transition-colors">TMO</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="rounded border-[var(--border-color)] text-electric-500 bg-[var(--bg-secondary)] w-4 h-4 cursor-pointer focus:ring-electric-500/50"/>
                    <span className="text-sm text-[var(--text-primary)] group-hover:text-electric-400 transition-colors">IMO</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span 
                      key={tag} 
                      className={`tag-interactive px-2.5 py-1 rounded-lg text-xs font-medium ${i === 0 ? 'bg-electric-500/10 text-electric-400' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Difficulty Slider */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 block">Difficulty</label>
                <input type="range" min="1200" max="3000" defaultValue="2000" className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-electric-500"/>
                <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mt-2 font-mono">
                  <span>1200</span>
                  <span>3000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--text-secondary)]">Showing <b className="text-[var(--text-primary)]">1-20</b> of <b className="text-[var(--text-primary)]">2,847</b></span>
            <select className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none cursor-pointer hover:border-electric-500/30 transition-colors">
              <option>Difficulty ↑</option>
              <option>Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {problems.map((p) => {
                const diffInfo = getDiffClass(p.difficulty)
                return (
                  <Link 
                    key={p.id} 
                    href={`/practice/${p.id}`}
                    className="card rounded-xl p-5 hover:border-electric-500/40 transition-all cursor-pointer group block"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-[var(--text-tertiary)] flex-shrink-0 font-medium">{p.code}</span>
                        <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors text-sm truncate">{p.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${diffInfo.class} flex-shrink-0 ml-2`}>
                        {diffInfo.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {p.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span className="font-mono">{p.difficulty} rating • {p.acceptance}% acc</span>
                      <span>{p._count?.submissions || 0} solved</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
