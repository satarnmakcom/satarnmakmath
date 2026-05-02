'use client'

import Link from 'next/link'

const subjects = [
  {
    id: 'algebra',
    title: 'Algebra',
    titleTh: 'พีชคณิต',
    modules: 12,
    progress: 65,
    color: 'electric',
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    description: 'Equations, inequalities, polynomials, and functional equations.',
    descriptionTh: 'สมการ อสมการ พหุนาม และสมการเชิงฟังก์ชัน'
  },
  {
    id: 'geometry',
    title: 'Geometry',
    titleTh: 'เรขาคณิต',
    modules: 15,
    progress: 42,
    color: 'violet',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    description: 'Euclidean geometry, transformations, and complex numbers.',
    descriptionTh: 'เรขาคณิตยุคลิด การแปลงทางเรขาคณิต และจำนวนเชิงซ้อน'
  },
  {
    id: 'number-theory',
    title: 'Number Theory',
    titleTh: 'ทฤษฎีจำนวน',
    modules: 10,
    progress: 78,
    color: 'orange',
    icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
    description: 'Divisibility, modular arithmetic, and Diophantine equations.',
    descriptionTh: 'ความหารลงตัว ระบบจำนวนเต็มมอดูลาร์ และสมการไดโอแฟนไทน์'
  },
  {
    id: 'combinatorics',
    title: 'Combinatorics',
    titleTh: 'การจัดหมู่',
    modules: 14,
    progress: 30,
    color: 'emerald',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    description: 'Counting, graph theory, and extremal combinatorics.',
    descriptionTh: 'การนับ ทฤษฎีกราฟ และการจัดหมู่เชิงสุดขีด'
  }
]

const colorClasses: Record<string, { bg: string; text: string; shadow: string; gradient: string }> = {
  electric: { bg: 'bg-electric-500/10', text: 'text-electric-400', shadow: 'shadow-electric-500/20', gradient: 'from-electric-400 to-blue-600' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', shadow: 'shadow-violet-500/20', gradient: 'from-violet-400 to-violet-600' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', shadow: 'shadow-orange-500/20', gradient: 'from-orange-400 to-red-500' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', shadow: 'shadow-emerald-500/20', gradient: 'from-emerald-400 to-emerald-600' }
}

export default function LearnPage() {
  return (
    <section className="max-w-6xl mx-auto space-y-5 md:space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Learning Modules</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Structured path from introductory camps to IMO</p>
      </div>

      {/* Level Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-5 py-2.5 rounded-xl bg-electric-500 text-white font-semibold text-sm whitespace-nowrap shadow-lg shadow-electric-500/25 transition-transform hover:scale-105">
          สอวน. ค่าย 1
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-sm whitespace-nowrap transition-all hover:border-electric-500/30 hover:shadow-md">
          สอวน. ค่าย 2
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-sm whitespace-nowrap transition-all hover:border-electric-500/30 hover:shadow-md">
          TMO
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-sm whitespace-nowrap transition-all hover:border-electric-500/30 hover:shadow-md">
          IMO
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {subjects.map((subject) => {
          const colors = colorClasses[subject.color]
          return (
            <Link 
              key={subject.id} 
              href={`/learn/${subject.id}`}
              className="card rounded-2xl p-6 hover:border-electric-500/40 cursor-pointer group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={subject.icon}/>
                  </svg>
                </div>
                <span className={`px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} text-xs font-bold`}>{subject.modules} Modules</span>
              </div>
              <h3 className={`text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:${colors.text.replace('text-', 'text-').replace('-400', '-500')} transition-colors`}>
                {subject.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{subject.description}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${colors.gradient.replace('to-blue-600', 'to-electric-400').replace('to-violet-600', 'to-violet-400').replace('to-red-500', 'to-orange-400').replace('to-emerald-600', 'to-emerald-400')} rounded-full`} style={{ width: `${subject.progress}%` }}></div>
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">{subject.progress}%</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
