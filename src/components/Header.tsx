'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'

interface HeaderProps {
  currentLang?: string
  onLanguageChange?: (lang: string) => void
}

const getRatingInfo = (rating: number) => {
  if (rating < 1200) return { title: 'Newbie', className: 'rating-newbie' }
  if (rating < 1400) return { title: 'Pupil', className: 'rating-pupil' }
  if (rating < 1600) return { title: 'Specialist', className: 'rating-specialist' }
  if (rating < 1900) return { title: 'Expert', className: 'rating-expert' }
  if (rating < 2400) return { title: 'Master', className: 'rating-master' }
  return { title: 'Grandmaster', className: 'rating-grandmaster' }
}

export default function Header({ currentLang = 'en', onLanguageChange }: HeaderProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const { data: session } = useSession()
  const userRating = session?.user?.rating || 1200
  const ratingInfo = getRatingInfo(userRating)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const setLanguage = (lang: string) => {
    onLanguageChange?.(lang)
    setLangDropdownOpen(false)
  }

  return (
    <header className="h-16 glass flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30">
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1">
        <motion.div
          animate={{ flexGrow: searchFocused ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 max-w-xl"
        >
          <div className={`search-input flex items-center bg-[var(--bg-secondary)] border ${searchFocused ? 'border-electric-500 ring-2 ring-electric-500/20' : 'border-[var(--border-color)]'} rounded-xl px-4 py-2.5 transition-all`}>
            <svg className={`w-4 h-4 ${searchFocused ? 'text-electric-500' : 'text-[var(--text-tertiary)]'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={currentLang === 'th' ? 'ค้นหาโจทย์, ผู้ใช้, แท็ก...' : 'Search problems, users, tags...'}
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
            />
            <span className="text-[10px] text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-md px-1.5 py-0.5 hidden sm:block font-mono">⌘K</span>
          </div>
        </motion.div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
        >
          {isDarkMode ? (
            <motion.svg
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              whileHover={{ rotate: 90 }}
              className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              whileHover={{ rotate: -90 }}
              className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </motion.svg>
          )}
        </motion.button>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <span className="text-xs tracking-widest font-bold">{currentLang.toUpperCase()}</span>
            <motion.svg
              animate={{ rotate: langDropdownOpen ? 180 : 0 }}
              className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute right-0 mt-2 w-48 card rounded-xl shadow-2xl py-2 z-50 border border-[var(--border-color)] overflow-hidden bg-[var(--bg-primary)]"
              >
                <button onClick={() => setLanguage('en')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3 relative overflow-hidden group">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-electric-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex-1">
                    <div className="font-medium text-[var(--text-primary)]">English</div>
                    <div className="text-xs text-[var(--text-tertiary)]">EN</div>
                  </div>
                  {currentLang === 'en' && (
                    <motion.div layoutId="langCheck" className="relative z-10 text-electric-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </motion.div>
                  )}
                </button>
                <button onClick={() => setLanguage('th')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3 relative overflow-hidden group">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-electric-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex-1">
                    <div className="font-medium text-[var(--text-primary)]">ไทย</div>
                    <div className="text-xs text-[var(--text-tertiary)]">TH</div>
                  </div>
                  {currentLang === 'th' && (
                    <motion.div layoutId="langCheck" className="relative z-10 text-electric-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </motion.div>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {session ? (
          <div className="flex items-center gap-2">
            <Link href="/profile" className="block ml-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)] group"
              >
                <img
                  src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user?.name}
                  alt={session.user?.name || "User"}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-400 to-violet-500 ring-2 ring-[var(--bg-primary)]"
                />
                <div className="hidden md:block text-left">
                  <div className={`text-xs font-bold leading-tight group-hover:opacity-80 transition-opacity truncate max-w-[100px] ${ratingInfo.className}`}>
                    {session.user?.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight font-mono">
                    {userRating} • {ratingInfo.title}
                  </div>
                </div>
              </motion.div>
            </Link>
            <button
              onClick={() => signOut()}
              className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-colors"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-primary px-4 py-2 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-transform ml-2">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
