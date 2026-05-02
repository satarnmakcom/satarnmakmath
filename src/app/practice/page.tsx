'use client'

import { useEffect, useState } from 'react'
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

function getDiffClass(diff: number) {
  if (diff < 1400) return { class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'EASY' }
  if (diff < 1800) return { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'MEDIUM' }
  if (diff < 2400) return { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'HARD' }
  return { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'INSANE' }
}

const tags = ['Functional Eq', 'Inequality', 'Geometry', 'Number Theory', 'Combinatorics', 'Graph Theory']

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  // This would ideally come from the real DB, but we mock it heavily here if DB is empty to show the UI
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getProblems({ limit: 20 })
      if (res.success && res.data && res.data.length > 0) {
        const data = res.data.map((p: any) => ({
          ...p,
          acceptance: Math.floor(Math.random() * 60) + 20
        }))
        setProblems(data)
      } else {
        // Fallback Mock Data to demonstrate the 7 levels if DB is empty
        const mockProblems: Problem[] = Array.from({ length: 15 }).map((_, i) => {
          const randomLevel = olympiadLevels[Math.floor(Math.random() * olympiadLevels.length)].id
          const difficulty = 1200 + Math.floor(Math.random() * 1800)
          return {
            id: `mock-${i}`,
            code: `${randomLevel}-${2023 - Math.floor(i/5)}-${(i%5)+1}`,
            title: `Sample Problem for ${randomLevel}`,
            level: randomLevel,
            difficulty,
            tags: [tags[Math.floor(Math.random() * 3)], tags[3 + Math.floor(Math.random() * 3)]],
            acceptance: Math.floor(Math.random() * 60) + 20,
            _count: { submissions: Math.floor(Math.random() * 500) }
          }
        })
        setProblems(mockProblems.sort((a, b) => a.difficulty - b.difficulty))
      }
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <section className="max-w-6xl mx-auto py-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Practice Arena</h1>
        <p className="text-[var(--text-secondary)]">ฝึกฝนโจทย์คณิตศาสตร์โอลิมปิกตั้งแต่ระดับพื้นฐานจนถึง IMO</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Sidebar Filters */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <div className="card rounded-2xl p-6 lg:sticky lg:top-4 border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[var(--text-primary)]">Filters</h3>
              <button className="text-xs text-electric-400 hover:text-electric-500 font-bold transition-colors">Reset</button>
            </div>
            
            <div className="space-y-6">
              {/* Level Filter */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Level</label>
                <div className="space-y-3">
                  {olympiadLevels.map((lvl) => (
                    <label key={lvl.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" defaultChecked={lvl.id === 'POSN1' || lvl.id === 'TMO'} className="peer appearance-none w-5 h-5 border-2 border-[var(--border-color)] rounded-md bg-[var(--bg-secondary)] checked:bg-electric-500 checked:border-electric-500 transition-colors cursor-pointer"/>
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{lvl.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={tag} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${i === 0 || i === 3 ? 'bg-electric-500/10 text-electric-500 border border-electric-500/20' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-tertiary)]'}`}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Difficulty Slider */}
              <div>
                <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Difficulty</label>
                <input type="range" min="1200" max="3000" defaultValue="2000" className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-electric-500"/>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-2 font-mono font-medium">
                  <span>1200</span>
                  <span>3000</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problem List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-secondary)] pl-3">Showing <b className="text-[var(--text-primary)]">1-{problems.length}</b> problems</span>
            <select className="bg-[var(--bg-secondary)] border border-transparent rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--border-color)] transition-colors focus:ring-2 focus:ring-electric-500/20">
              <option>Difficulty ↑</option>
              <option>Difficulty ↓</option>
              <option>Newest</option>
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
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
              className="space-y-4"
            >
              {problems.map((p) => {
                const diffInfo = getDiffClass(p.difficulty)
                return (
                  <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                    <Link 
                      href={`/practice/${p.id}`}
                      className="card rounded-2xl p-5 border border-[var(--border-color)] hover:border-electric-500/40 hover:shadow-lg hover:shadow-electric-500/5 transition-all cursor-pointer group block bg-[var(--bg-card)]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 group-hover:bg-electric-500/10 transition-colors">
                            <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-electric-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-[var(--text-primary)] group-hover:text-electric-500 transition-colors text-base truncate">{p.title}</h4>
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
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded-md bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[10px] font-semibold uppercase tracking-wide hover:bg-[var(--border-color)] transition-colors">{tag}</span>
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
        </div>
      </div>
    </section>
  )
}
