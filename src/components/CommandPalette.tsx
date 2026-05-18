'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { globalSearch, type SearchResult } from '@/actions/search'
import { useLanguage } from '@/context/LanguageContext'

const RECENT_KEY = 'satarnmak-recent-searches'
const MAX_RECENT = 5

// Quick-access navigation items
const quickLinks = [
  { id: 'nav-practice', title: 'Practice Arena', href: '/practice', icon: 'M13 10V3L4 14h7v7l9-11h-7z', type: 'nav' as const },
  { id: 'nav-learn', title: 'Curriculum', href: '/learn', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', type: 'nav' as const },
  { id: 'nav-contests', title: 'Contests', href: '/contests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', type: 'nav' as const },
  { id: 'nav-leaderboard', title: 'Leaderboard', href: '/leaderboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', type: 'nav' as const },
  { id: 'nav-profile', title: 'Profile', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', type: 'nav' as const },
  { id: 'nav-settings', title: 'Settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', type: 'nav' as const },
]

const typeIcons: Record<string, string> = {
  problem: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  module: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  lesson: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  nav: 'M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z',
}

const typeColors: Record<string, string> = {
  problem: 'text-electric-400 bg-electric-500/10',
  module: 'text-violet-400 bg-violet-500/10',
  lesson: 'text-emerald-400 bg-emerald-500/10',
  user: 'text-amber-400 bg-amber-500/10',
  nav: 'text-[var(--text-tertiary)] bg-[var(--bg-secondary)]',
}

const typeLabels: Record<string, string> = {
  problem: 'Problem',
  module: 'Module',
  lesson: 'Lesson',
  user: 'User',
  nav: 'Navigate',
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t } = useLanguage()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecentSearches(JSON.parse(stored))
    } catch {}
  }, [])

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const res = await globalSearch(query)
      if (res.success && res.data) {
        setResults(res.data)
      }
      setLoading(false)
      setSelectedIndex(0)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Compute display items
  const displayItems = query.trim()
    ? results
    : [
        // Show quick links when no query
        ...quickLinks.map(l => ({
          id: l.id,
          type: l.type,
          title: l.title,
          subtitle: 'Navigate',
          href: l.href,
        } as SearchResult)),
        ...(recentSearches.length > 0 ? recentSearches : []),
      ]

  // Navigate to result
  const goToResult = useCallback((item: SearchResult) => {
    // Save to recent (avoid duplicates, cap at MAX_RECENT)
    const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, MAX_RECENT)
    setRecentSearches(updated)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)) } catch {}

    setIsOpen(false)
    router.push(item.href)
  }, [recentSearches, router])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, displayItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && displayItems[selectedIndex]) {
      e.preventDefault()
      goToResult(displayItems[selectedIndex])
    }
  }, [displayItems, selectedIndex, goToResult])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_KEY)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-electric-500/40 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all cursor-pointer group min-w-[220px]"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm flex-1 text-left">{t('search.placeholder')}</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-mono font-bold text-[var(--text-tertiary)] group-hover:border-electric-500/30 transition-colors">
          ⌘K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-[95vw] max-w-[640px] z-[101] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl shadow-black/40 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 border-b border-[var(--border-color)]">
                <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${loading ? 'text-electric-400 animate-pulse' : 'text-[var(--text-tertiary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('search.input_placeholder')}
                  className="flex-1 py-4 bg-transparent text-[var(--text-primary)] text-base outline-none placeholder:text-[var(--text-tertiary)]"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <kbd className="hidden sm:inline-flex px-2 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-mono font-bold text-[var(--text-tertiary)]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain">
                {/* Section headers */}
                {!query.trim() && recentSearches.length > 0 && (
                  <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('search.recent')}</span>
                    <button onClick={clearRecent} className="text-[10px] font-bold text-[var(--text-tertiary)] hover:text-rose-400 transition-colors uppercase tracking-wider">
                      {t('search.clear')}
                    </button>
                  </div>
                )}

                {!query.trim() && (
                  <div className="px-5 pt-3 pb-1">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{t('search.quick_nav')}</span>
                  </div>
                )}

                {query.trim() && results.length > 0 && (
                  <div className="px-5 pt-3 pb-1">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                      {t('search.results')} ({results.length})
                    </span>
                  </div>
                )}

                {displayItems.map((item, i) => {
                  const isSelected = i === selectedIndex
                  const icon = typeIcons[item.type] || typeIcons.nav
                  const color = typeColors[item.type] || typeColors.nav
                  const label = typeLabels[item.type] || ''

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => goToResult(item)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-electric-500/10'
                          : 'hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm truncate ${isSelected ? 'text-electric-400' : 'text-[var(--text-primary)]'}`}>
                            {item.title}
                          </span>
                          {label && item.type !== 'nav' && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${color}`}>
                              {label}
                            </span>
                          )}
                        </div>
                        {item.subtitle && item.subtitle !== 'Navigate' && (
                          <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{item.subtitle}</p>
                        )}
                      </div>

                      {/* Meta / shortcut hint */}
                      {item.meta && (
                        <span className="text-[11px] font-mono text-[var(--text-tertiary)] flex-shrink-0">{item.meta}</span>
                      )}

                      {isSelected && (
                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}

                {/* Empty state */}
                {query.trim() && !loading && results.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="text-3xl mb-3">🔍</div>
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">{t('search.no_results')}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{t('search.try_different')}</p>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div className="px-5 py-8 flex justify-center">
                    <div className="w-6 h-6 border-2 border-electric-500/30 border-t-electric-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono font-bold">↑↓</kbd>
                  <span>{t('search.navigate')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono font-bold">↵</kbd>
                  <span>{t('search.select')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono font-bold">esc</kbd>
                  <span>{t('search.close')}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
