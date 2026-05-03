'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/context/LanguageContext'

const navItems = [
  { id: 'dashboard', href: '/', labelKey: 'sidebar.dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'learn', href: '/learn', labelKey: 'sidebar.learn', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'practice', href: '/practice', labelKey: 'sidebar.practice', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'leaderboard', href: '/leaderboard', labelKey: 'sidebar.leaderboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'profile', href: '/profile', labelKey: 'sidebar.profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const getRankProgress = (rating: number) => {
  if (rating < 1200) return { current: 'Newbie', next: 'Pupil', percent: Math.max(0, (rating / 1200) * 100) }
  if (rating < 1400) return { current: 'Pupil', next: 'Specialist', percent: Math.max(0, ((rating - 1200) / 200) * 100) }
  if (rating < 1600) return { current: 'Specialist', next: 'Expert', percent: Math.max(0, ((rating - 1400) / 200) * 100) }
  if (rating < 1900) return { current: 'Expert', next: 'Master', percent: Math.max(0, ((rating - 1600) / 300) * 100) }
  if (rating < 2400) return { current: 'Master', next: 'Grandmaster', percent: Math.max(0, ((rating - 1900) / 500) * 100) }
  return { current: 'Grandmaster', next: 'Max', percent: 100 }
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useSession()
  const { t } = useLanguage()
  const userRating = session?.user?.rating || 1200
  const progressInfo = getRankProgress(userRating)

  // Auto-collapse sidebar on mobile if screen is small
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false) // Mobile uses standard width, controlled by isOpen
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <motion.aside 
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 256,
          x: isOpen || typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : -256
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:relative flex-shrink-0 flex flex-col h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] z-50 overflow-hidden shadow-2xl md:shadow-none"
      >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] flex-shrink-0 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <motion.div 
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500 to-violet-600 flex items-center justify-center shadow-lg shadow-electric-500/25 mr-3 flex-shrink-0"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </motion.div>
        
        <AnimatePresence>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10, display: 'none' }}
              className="text-lg font-bold text-gradient tracking-tight whitespace-nowrap"
            >
              SatarnMath
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {navItems.map((item, index) => {
          const active = isActive(item.href)
          return (
            <Link href={item.href} key={item.id} className="block w-full">
              <motion.div
                whileHover={{ scale: 1.02, x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active 
                    ? 'text-electric-500 bg-[var(--bg-elevated)] shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {active && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
                  <svg className={`w-5 h-5 flex-shrink-0 ${active ? 'text-electric-500' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                  </svg>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ml-3 whitespace-nowrap"
                      >
                        {t(item.labelKey)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Link>
          )
        })}

        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ delay: 0.3 }}
              className="pt-4 mt-6 border-t border-[var(--border-color)]"
            >
              <div className="flex items-center justify-between mb-2 px-3">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  {t('sidebar.your_progress')}
                </span>
              </div>
              <div className="px-3 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[var(--text-secondary)] font-medium truncate max-w-[120px]">{progressInfo.current} &rarr; {progressInfo.next}</span>
                  <span className="text-electric-400 font-bold ml-2">{Math.round(progressInfo.percent)}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressInfo.percent}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-electric-500 to-violet-500 rounded-full" 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[var(--border-color)] flex-shrink-0">
        <Link href="/settings">
          <motion.div 
            whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-elevated)' }}
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {!collapsed && <span>{t('sidebar.settings')}</span>}
          </motion.div>
        </Link>
      </div>
    </motion.aside>
    </>
  )
}

