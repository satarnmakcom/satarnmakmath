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
  { id: 'contests', href: '/contests', labelKey: 'sidebar.contests', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'leaderboard', href: '/leaderboard', labelKey: 'sidebar.leaderboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'profile', href: '/profile', labelKey: 'sidebar.profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

import { getRankProgress } from '@/lib/rating'

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
        transition={{ type: "spring", stiffness: 350, damping: 40 }}
        className="fixed md:relative flex-shrink-0 flex flex-col h-full border-r border-[var(--border-color)] bg-[var(--bg-primary)] z-50 overflow-hidden shadow-2xl md:shadow-none transition-all duration-300"
      >
        {/* Hamburger & Title */}
        <div className="h-16 flex items-center px-4 md:px-6 border-b border-[var(--border-color)] flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors mr-2 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, display: 'none' }}
                className="flex items-center"
              >
                <span className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                  Satarnmak Math
                </span>
              </motion.div>
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
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 group ${active
                      ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/40'
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-[15%] bottom-[15%] w-[3px] bg-electric-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center w-full' : 'ml-1'}`}>
                    <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ delay: 0.2 }}
                className="pt-4 mt-4 border-t border-[var(--border-color)]"
              >
                <div className="flex items-center justify-between mb-2 px-3">
                  <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                    {t('sidebar.your_progress')}
                  </span>
                </div>
                <div className="px-3 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] truncate">{progressInfo.current}</span>
                    <span className="text-[11px] font-mono text-[var(--text-primary)] font-medium ml-2 shrink-0">{Math.round(progressInfo.percent)}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressInfo.percent}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-electric-500 rounded-full"
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
              whileHover={{ backgroundColor: 'var(--bg-elevated)' }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group`}
            >
              <img
                src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session?.user?.name}
                alt="Profile"
                className="w-6 h-6 rounded-full bg-gradient-to-br from-electric-400 to-violet-500 ring-1 ring-[var(--border-color)] object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all"
              />
              {!collapsed && <span className="truncate">{session?.user?.name || t('sidebar.settings')}</span>}
            </motion.div>
          </Link>
        </div>
      </motion.aside>
    </>
  )
}

