'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const olympiadLevels = [
  {
    id: 'posn',
    title: 'สอวน. คัดเข้าค่าย 1',
    short: 'POSN',
    color: 'emerald',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    description: 'รอบคัดเลือกเพื่อเข้าสู่ค่าย 1 เน้นพื้นฐาน ม.ต้น และ ม.ปลายตอนต้น',
    modules: [
      { name: 'Basic Algebra', count: 12 },
      { name: 'Basic Geometry', count: 15 },
      { name: 'Number Theory', count: 10 },
      { name: 'Counting & Probability', count: 8 },
    ]
  },
  {
    id: 'posn1',
    title: 'สอวน. ค่าย 1',
    short: 'POSN 1',
    color: 'teal',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    description: 'เนื้อหาค่าย 1 เจาะลึก ทฤษฎีจำนวน พีชคณิต เรขาคณิต และการจัดหมู่',
    modules: [
      { name: 'Polynomials', count: 14 },
      { name: 'Circle Geometry', count: 12 },
      { name: 'Modular Arithmetic', count: 18 },
      { name: 'Combinatorics', count: 15 },
    ]
  },
  {
    id: 'posn2',
    title: 'สอวน. ค่าย 2',
    short: 'POSN 2',
    color: 'cyan',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    description: 'เนื้อหาค่าย 2 เตรียมพร้อมสู่การแข่งขันระดับประเทศ (TMO)',
    modules: [
      { name: 'Functional Equations', count: 10 },
      { name: 'Geometric Transformations', count: 8 },
      { name: 'Diophantine Equations', count: 12 },
      { name: 'Graph Theory', count: 14 },
    ]
  },
  {
    id: 'tmo',
    title: 'TMO',
    short: 'TMO',
    color: 'blue',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    description: 'การแข่งขันคณิตศาสตร์โอลิมปิกระดับชาติ (Thailand Mathematical Olympiad)',
    modules: [
      { name: 'Advanced Inequalities', count: 16 },
      { name: 'Projective Geometry', count: 12 },
      { name: 'Advanced Number Theory', count: 15 },
      { name: 'Extremal Combinatorics', count: 10 },
    ]
  },
  {
    id: 'ipst1',
    title: 'สสวท. ค่าย 1',
    short: 'IPST 1',
    color: 'electric',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    description: 'ค่ายคัดเลือกผู้แทนประเทศ ค่ายที่ 1 (IPST Camp 1)',
    modules: [
      { name: 'Abstract Algebra', count: 8 },
      { name: 'Inversion & Complex Geometry', count: 14 },
      { name: 'Algebraic Number Theory', count: 12 },
      { name: 'Probabilistic Method', count: 10 },
    ]
  },
  {
    id: 'ipst2',
    title: 'สสวท. ค่าย 2',
    short: 'IPST 2',
    color: 'violet',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    description: 'ค่ายคัดเลือกผู้แทนประเทศ ค่ายที่ 2 (IPST Camp 2)',
    modules: [
      { name: 'Galois Theory (Basics)', count: 6 },
      { name: 'Algebraic Geometry Intro', count: 8 },
      { name: 'Analytic Number Theory', count: 10 },
      { name: 'Additive Combinatorics', count: 12 },
    ]
  },
  {
    id: 'imo',
    title: 'IMO',
    short: 'IMO',
    color: 'orange',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    description: 'การแข่งขันคณิตศาสตร์โอลิมปิกระหว่างประเทศ (International Mathematical Olympiad)',
    modules: [
      { name: 'Final Preparation', count: 5 },
      { name: 'Complex Problem Solving', count: 20 },
      { name: 'IMO Mock Exams', count: 6 },
    ]
  }
]

const colorMap: Record<string, { bg: string, text: string, border: string, gradient: string, shadow: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', gradient: 'from-emerald-400 to-green-600', shadow: 'shadow-emerald-500/20' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/30', gradient: 'from-teal-400 to-emerald-500', shadow: 'shadow-teal-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30', gradient: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20' },
  electric: { bg: 'bg-electric-500/10', text: 'text-electric-500', border: 'border-electric-500/30', gradient: 'from-electric-400 to-violet-600', shadow: 'shadow-electric-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30', gradient: 'from-violet-400 to-purple-600', shadow: 'shadow-violet-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30', gradient: 'from-orange-400 to-red-500', shadow: 'shadow-orange-500/20' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function LearnPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 overflow-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 text-electric-500 text-xs font-bold mb-4 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse"></span>
          Curriculum Pathway
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4 text-gradient">
          The Road to IMO
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          เส้นทางการเรียนรู้คณิตศาสตร์โอลิมปิกอย่างเป็นระบบ ตั้งแต่ค่ายแรกไปจนถึงระดับนานาชาติ
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative pb-20"
      >
        {/* Continuous Line */}
        <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-500 via-electric-500 to-orange-500 rounded-full opacity-20 transform md:-translate-x-1/2"></div>

        <div className="space-y-12">
          {olympiadLevels.map((level, index) => {
            const isEven = index % 2 === 0
            const c = colorMap[level.color]

            return (
              <motion.div 
                key={level.id}
                variants={itemVariants}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Node */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-xl ${c.shadow} ring-4 ring-[var(--bg-primary)] z-10`}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={level.icon}/>
                    </svg>
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className={`card p-6 rounded-3xl border ${c.border} hover:shadow-2xl hover:${c.shadow} transition-all duration-300 relative overflow-hidden group`}
                  >
                    <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-32 h-32 bg-gradient-to-br ${c.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
                    
                    <div className="relative z-10">
                      <div className={`inline-block px-3 py-1 rounded-lg ${c.bg} ${c.text} text-xs font-bold mb-3`}>
                        Level {index + 1}
                      </div>
                      <h3 className={`text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:${c.text} transition-colors`}>
                        {level.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                        {level.description}
                      </p>

                      <div className="space-y-2">
                        {level.modules.map((mod, i) => (
                          <div key={i} className={`flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group/item ${isEven ? 'flex-row-reverse md:flex-row' : ''}`}>
                            <div className={`flex items-center gap-3 ${isEven ? 'flex-row-reverse md:flex-row' : ''}`}>
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${c.gradient}`}></div>
                              <span className="text-sm font-medium text-[var(--text-primary)] group-hover/item:text-[var(--text-primary)]">{mod.name}</span>
                            </div>
                            <span className="text-xs text-[var(--text-tertiary)] font-mono bg-[var(--bg-card)] border border-[var(--border-color)] px-2 py-0.5 rounded-md">{mod.count} Lessons</span>
                          </div>
                        ))}
                      </div>

                      <div className={`mt-6 pt-4 border-t border-[var(--border-color)] flex justify-${isEven ? 'start md:end' : 'start'}`}>
                        <button className={`flex items-center gap-2 text-sm font-bold ${c.text} hover:opacity-80 transition-opacity ${isEven ? 'flex-row-reverse md:flex-row' : ''}`}>
                          เริ่มเรียนรู้ 
                          <svg className={`w-4 h-4 transform ${isEven ? 'rotate-180 md:rotate-0' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
