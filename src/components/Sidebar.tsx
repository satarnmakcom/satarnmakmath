'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { id: 'dashboard', href: '/', label: 'Dashboard', labelTh: 'แดชบอร์ด', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'learn', href: '/learn', label: 'Learn', labelTh: 'เรียนรู้', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'practice', href: '/practice', label: 'Practice', labelTh: 'ฝึกฝน', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'leaderboard', href: '/leaderboard', label: 'Leaderboard', labelTh: 'กระดานผู้นำ', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'profile', href: '/profile', label: 'Profile', labelTh: 'โปรไฟล์', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

interface SidebarProps {
  currentLang?: string
}

export default function Sidebar({ currentLang = 'en' }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className={`${collapsed ? 'w-0 sidebar-collapsed' : 'w-64'} flex-shrink-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] z-40 transition-all duration-300`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-violet-600 flex items-center justify-center shadow-lg shadow-electric-500/25 mr-3 flex-shrink-0 float-anim">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </div>
        <span className="text-lg font-bold text-gradient tracking-tight whitespace-nowrap">SatarnMath</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] ${isActive(item.href) ? 'active' : ''}`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
            </svg>
            <span>{currentLang === 'th' ? item.labelTh : item.label}</span>
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
          <p className="px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            {currentLang === 'th' ? 'ความคืบหน้าของคุณ' : 'Your Progress'}
          </p>
          <div className="px-4 py-3">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--text-secondary)] font-medium">Expert &rarr; CM</span>
              <span className="text-electric-400 font-bold">80%</span>
            </div>
            <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-electric-500 to-violet-500 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[var(--border-color)] flex-shrink-0">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>{currentLang === 'th' ? 'ตั้งค่า' : 'Settings'}</span>
        </button>
      </div>
    </aside>
  )
}
