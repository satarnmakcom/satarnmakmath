'use client'

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

interface ProblemSet {
  id: string
  title: string
  description: string | null
  timeLimitMinutes: number
  isPublic: boolean
  _count: { items: number }
}

interface ContestsClientProps {
  sets: ProblemSet[]
}

export default function ContestsClient({ sets }: ContestsClientProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header Section */}
      <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-2xl shadow-2xl shadow-black/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-electric-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 text-electric-400 text-xs font-bold tracking-wider uppercase mb-4 border border-electric-500/20">
            <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse"></span>
            {t('contests.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
            {t('contests.title')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-violet-400">{t('contests.title2')}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            {t('contests.desc')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sets.map(set => (
          <Link 
            key={set.id} 
            href={`/contests/${encodeURIComponent(set.title)}`} 
            className="group relative flex flex-col bg-gradient-to-br from-[var(--bg-card)] to-transparent rounded-3xl p-[1px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-electric-500/10 cursor-pointer"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--border-color)] to-transparent group-hover:from-electric-500/50 group-hover:to-violet-500/50 transition-colors duration-500 rounded-3xl"></div>
            
            <div className="relative h-full flex flex-col bg-[var(--glass-bg)] backdrop-blur-xl rounded-[23px] p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[23px]" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-electric-500/10 to-violet-500/10 border border-electric-500/20 flex items-center justify-center text-electric-400 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-bold px-3 py-1 rounded-full border border-[var(--border-color)]">
                  {t('contests.mock_badge')}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors mb-2 line-clamp-1">{set.title}</h3>
              
              {set.description ? (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 flex-grow">{set.description}</p>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] italic mb-6 flex-grow">{t('contests.no_desc')}</p>
              )}
              
              <div className="flex items-center gap-4 mt-auto border-t border-[var(--border-color)] pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl">
                  <svg className="w-4 h-4 text-electric-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {set.timeLimitMinutes} {t('contests.mins')}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {set._count.items} {t('contests.problems')}
                </div>
              </div>

              {/* Enter Button Overlay */}
              <div className="absolute inset-0 bg-[var(--bg-card)]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-[22px]">
                <div className="bg-electric-500 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-electric-500/30 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {t('contests.enter')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {sets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">⏳</span>
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('contests.empty_title')}</h3>
            <p className="text-[var(--text-secondary)] text-center max-w-md">
              {t('contests.empty_desc')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
