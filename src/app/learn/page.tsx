'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getCurriculum } from '@/actions/curriculum'

const levelConfig: Record<string, { title: string; color: string; icon: string; desc: string }> = {
  POSN: {
    title: 'สอวน. คัดเข้าค่าย 1',
    color: 'emerald',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'รอบคัดเลือกเพื่อเข้าสู่ค่าย 1 เน้นพื้นฐาน ม.ต้น และ ม.ปลายตอนต้น'
  },
  POSN1: {
    title: 'สอวน. ค่าย 1',
    color: 'teal',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    desc: 'เนื้อหาค่าย 1 เจาะลึก ทฤษฎีจำนวน พีชคณิต เรขาคณิต และการจัดหมู่'
  },
  POSN2: {
    title: 'สอวน. ค่าย 2',
    color: 'cyan',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    desc: 'เนื้อหาค่าย 2 เตรียมพร้อมสู่การแข่งขันระดับประเทศ (TMO)'
  },
  TMO: {
    title: 'TMO',
    color: 'blue',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    desc: 'การแข่งขันคณิตศาสตร์โอลิมปิกระดับชาติ (Thailand Mathematical Olympiad)'
  },
  IPST1: {
    title: 'สสวท. ค่าย 1',
    color: 'indigo',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    desc: 'รอบคัดเลือกผู้แทนประเทศ'
  },
  IPST2: {
    title: 'สสวท. ค่าย 2',
    color: 'violet',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    desc: 'ค่ายคัดเลือกผู้แทนประเทศขั้นสุดท้าย'
  },
  IMO: {
    title: 'IMO',
    color: 'fuchsia',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    desc: 'International Mathematical Olympiad'
  }
}

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
  teal: 'text-teal-500 bg-teal-500/10 border-teal-500/20 shadow-teal-500/10',
  cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
  indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
  violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20 shadow-violet-500/10',
  fuchsia: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20 shadow-fuchsia-500/10',
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState('POSN')
  const [loading, setLoading] = useState(true)
  const [groupedModules, setGroupedModules] = useState<Record<string, any[]>>({})

  useEffect(() => {
    async function load() {
      const res = await getCurriculum()
      if (res.success && res.data) {
        const groups: Record<string, any[]> = {}
        for (const level of Object.keys(levelConfig)) {
          groups[level] = []
        }
        for (const mod of res.data) {
          if (!groups[mod.level]) groups[mod.level] = []
          groups[mod.level].push(mod)
        }
        setGroupedModules(groups)
        
        // Find first level that has modules
        const firstActive = Object.keys(groups).find(k => groups[k].length > 0)
        if (firstActive) setActiveTab(firstActive)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section className="max-w-7xl mx-auto py-6 px-4 md:px-8 relative">
      {/* Background glow for the header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4 backdrop-blur-md">
          <span className="text-xs font-semibold tracking-wide text-violet-400 uppercase">Structured Learning</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-violet-500">Competitive Math</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
          เส้นทางสู่คณิตศาสตร์โอลิมปิก เนื้อหาถูกย่อยและออกแบบมาเพื่อให้เข้าใจง่ายที่สุด 
          ผ่านการฝึกฝนที่เป็นระบบ
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-electric-500"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Navigation Timeline (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-6 h-fit">
            <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-6 pl-4">Curriculum Pipeline</h3>
            <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-[var(--border-color)]">
              {Object.entries(levelConfig).map(([id, info]) => {
                const isActive = activeTab === id
                const colorClasses = colorMap[info.color]
                const colorHex = isActive ? 'currentColor' : 'var(--text-tertiary)'
                const hasModules = groupedModules[id]?.length > 0
                
                return (
                  <button
                    key={id}
                    onClick={() => hasModules && setActiveTab(id)}
                    disabled={!hasModules}
                    className={`w-full text-left relative flex items-center gap-4 py-3 pr-4 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[var(--bg-secondary)]' 
                        : hasModules 
                          ? 'hover:bg-[var(--bg-secondary)]' 
                          : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full border-4 border-[var(--bg-primary)] ${
                      isActive ? colorClasses : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border-[var(--border-color)]'
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <span className={`block text-sm font-bold transition-colors ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {info.title}
                      </span>
                      {hasModules && <span className="text-[10px] text-electric-400 font-bold">{groupedModules[id]?.length} Modules</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden flex overflow-x-auto pb-4 gap-2 snap-x hide-scrollbar">
            {Object.entries(levelConfig).map(([id, info]) => {
              const hasModules = groupedModules[id]?.length > 0
              if (!hasModules) return null
              const isActive = activeTab === id
              const colorClasses = colorMap[info.color]
              
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    isActive 
                      ? colorClasses
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  {info.title}
                </button>
              )
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {Object.entries(levelConfig).map(([id, info]) => {
                if (activeTab !== id) return null
                const colorClasses = colorMap[info.color]
                const modules = groupedModules[id] || []

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="card rounded-3xl p-6 md:p-10 border border-[var(--border-color)] overflow-hidden relative group bg-[var(--glass-bg)] backdrop-blur-xl shadow-xl shadow-black/5">
                      <div className={`absolute top-0 right-0 w-80 h-80 blur-3xl opacity-20 transition-opacity duration-700 pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3 ${colorClasses.split(' ')[1]}`}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-5">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${colorClasses}`}>
                            {id}
                          </span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-[var(--text-primary)] mb-4">{info.title}</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xl text-lg">
                          {info.desc}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {modules.map((mod) => (
                            <Link key={mod.id} href={`/learn/${mod.id}`} className="group/item">
                              <div className="bg-gradient-to-br from-[var(--bg-card)] to-transparent border border-[var(--border-color)] group-hover/item:border-electric-500/40 group-hover/item:shadow-xl group-hover/item:shadow-electric-500/10 p-6 rounded-3xl transition-all duration-300 h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                  <div className="w-2.5 h-2.5 rounded-full bg-electric-500 group-hover/item:scale-150 transition-transform"></div>
                                  <h4 className="font-bold text-lg text-[var(--text-primary)] group-hover/item:text-electric-400 transition-colors">{mod.title}</h4>
                                </div>
                                {mod.description && <p className="text-sm text-[var(--text-secondary)] mb-6 pl-6 line-clamp-2 relative z-10">{mod.description}</p>}
                                <div className="pl-6 flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]/50 relative z-10">
                                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                                    {mod.lessons.length} Lessons
                                  </span>
                                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover/item:bg-electric-500 group-hover/item:text-white text-[var(--text-tertiary)] transition-colors">
                                    <svg className="w-4 h-4 group-hover/item:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        
                        {modules.length === 0 && (
                          <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                            <p className="text-[var(--text-secondary)] font-medium">Coming soon! Curriculum for this level is being crafted.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  )
}
