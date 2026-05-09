'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getProblems } from '@/actions/problems'
import { motion, AnimatePresence } from 'framer-motion'

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

const olympiadLevels = [
  { id: 'POSN', name: 'สอวน. คัดเข้าค่าย 1' },
  { id: 'POSN1', name: 'สอวน. ค่าย 1' },
  { id: 'POSN2', name: 'สอวน. ค่าย 2' },
  { id: 'TMO', name: 'TMO' },
  { id: 'IPST1', name: 'สสวท. ค่าย 1' },
  { id: 'IPST2', name: 'สสวท. ค่าย 2' },
  { id: 'IMO', name: 'IMO' },
]

const ALL_TAGS = ['Functional Eq', 'Inequality', 'Geometry', 'Number Theory', 'Combinatorics', 'Graph Theory']

function getDiffClass(diff: number) {
  if (diff < 1400) return { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'EASY' }
  if (diff < 1800) return { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'MEDIUM' }
  if (diff < 2400) return { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'HARD' }
  return { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'INSANE' }
}

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [maxDifficulty, setMaxDifficulty] = useState(4000)
  const [sortBy, setSortBy] = useState<'asc' | 'desc' | 'new'>('asc')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getProblems({ limit: 500 })
      if (res.success && res.data) {
        const data = (res.data as any[]).map((p: any) => ({
          ...p,
          acceptance: p._count?.submissions > 0
            ? Math.round((p._count.submissions / Math.max(p._count.submissions * 1.5, 1)) * 100)
            : 0
        }))
        setProblems(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const toggleLevel = (id: string) => {
    setSelectedLevels(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  const resetFilters = () => {
    setSelectedLevels(new Set())
    setSelectedTags(new Set())
    setMaxDifficulty(4000)
    setSortBy('asc')
  }

  const filteredProblems = useMemo(() => {
    let result = problems.filter(p => {
      const levelMatch = selectedLevels.size === 0 || selectedLevels.has(p.level)
      const tagMatch = selectedTags.size === 0 || p.tags.some(t => selectedTags.has(t))
      const diffMatch = (p.difficulty ?? 0) <= maxDifficulty
      return levelMatch && tagMatch && diffMatch
    })

    if (sortBy === 'asc') result = [...result].sort((a, b) => a.difficulty - b.difficulty)
    else if (sortBy === 'desc') result = [...result].sort((a, b) => b.difficulty - a.difficulty)

    return result
  }, [problems, selectedLevels, selectedTags, maxDifficulty, sortBy])

  const hasFilters = selectedLevels.size > 0 || selectedTags.size > 0 || maxDifficulty < 4000

  return (
    <section className="max-w-6xl mx-auto py-6 px-4 md:px-6 relative">
      {/* Background glow for the header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-electric-500/10 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-500/20 mb-4 backdrop-blur-md">
          <span className="text-xs font-semibold tracking-wide text-electric-400 uppercase">Interactive Problems</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[var(--text-primary)] tracking-tight mb-3">Practice Arena</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl">ฝึกฝนโจทย์คณิตศาสตร์โอลิมปิกตั้งแต่ระดับพื้นฐานจนถึง IMO ไต่แรงก์และพัฒนาตัวเองในทุกๆ วัน</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Sidebar Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-72 flex-shrink-0"
        >
          <div className="card rounded-3xl p-6 lg:sticky lg:top-8 border border-[var(--border-color)] shadow-xl shadow-black/5 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-secondary)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[var(--text-primary)]">Filters</h3>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-electric-400 hover:text-electric-300 font-bold transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Level Filter */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Level</label>
                <div className="space-y-3">
                  {olympiadLevels.map((lvl) => {
                    const isChecked = selectedLevels.has(lvl.id)
                    return (
                      <label key={lvl.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleLevel(lvl.id)}>
                        <div className="relative flex items-center justify-center flex-shrink-0">
                          <div className={`w-5 h-5 border-2 rounded-md transition-all ${isChecked ? 'bg-electric-500 border-electric-500' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] group-hover:border-electric-500/50'}`}>
                            {isChecked && (
                              <svg className="absolute inset-0 w-full h-full p-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                          {lvl.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((tag) => {
                    const isActive = selectedTags.has(tag)
                    return (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                          isActive
                            ? 'bg-electric-500/10 text-electric-400 border-electric-500/40'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-tertiary)]'
                        }`}
                      >
                        {tag}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Difficulty Slider */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Max Difficulty</label>
                  <span className="text-xs font-mono font-bold text-electric-400">{maxDifficulty}</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="4000"
                  step="100"
                  value={maxDifficulty}
                  onChange={e => setMaxDifficulty(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-electric-500"
                />
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-2 font-mono font-medium">
                  <span>800</span>
                  <span>4000</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problem List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 bg-[var(--glass-bg)] backdrop-blur-md p-2 pl-4 rounded-2xl border border-[var(--glass-border)] shadow-sm">
            <span className="text-sm text-[var(--text-secondary)] pl-3">
              Showing <b className="text-[var(--text-primary)]">{filteredProblems.length}</b> of {problems.length} problems
              {hasFilters && <span className="ml-1 text-electric-400 font-medium">(filtered)</span>}
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[var(--bg-secondary)] border border-transparent rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--border-color)] transition-colors focus:ring-2 focus:ring-electric-500/20"
            >
              <option value="asc">Difficulty ↑</option>
              <option value="desc">Difficulty ↓</option>
              <option value="new">Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="rounded-full h-10 w-10 border-b-2 border-electric-500"
              />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProblems.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-[var(--text-secondary)]"
                >
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="font-semibold">No problems match your filters</p>
                  <button onClick={resetFilters} className="mt-4 text-electric-400 hover:text-electric-300 text-sm font-semibold">
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
                  }}
                  className="space-y-4"
                >
                  {filteredProblems.map((p) => {
                    const diffInfo = getDiffClass(p.difficulty)
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                      >
                        <Link
                          href={`/practice/${p.code}`}
                          className="card rounded-3xl p-5 border border-[var(--border-color)] hover:border-electric-500/40 hover:shadow-2xl hover:shadow-electric-500/10 transition-all duration-300 cursor-pointer group block bg-gradient-to-br from-[var(--bg-card)] to-transparent relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 group-hover:bg-electric-500/10 transition-colors">
                                <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-electric-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors text-base truncate">{p.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-mono text-[var(--text-tertiary)] font-medium bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md">{p.code}</span>
                                  <span className="text-xs text-[var(--text-secondary)] font-medium">• {p.level}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider border ${diffInfo.class}`}>
                                {diffInfo.label}
                              </span>
                              <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">{p.difficulty}</span>
                            </div>
                          </div>

                          <div className="relative z-10 flex items-center justify-between mt-5 pt-5 border-t border-[var(--border-color)]">
                            <div className="flex flex-wrap gap-2">
                              {p.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${
                                    selectedTags.has(tag)
                                      ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-medium">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {p.acceptance}%
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                {p._count?.submissions || 0}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  )
}
