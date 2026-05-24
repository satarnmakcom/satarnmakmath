'use client'

import React, { useState, useEffect } from 'react'
import { getProblems } from '@/actions/problems'
import { getLeaderboard } from '@/actions/users'

export default function MainApp() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentLang, setCurrentLang] = useState('en')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  
  // Dynamic Data State
  const [problems, setProblems] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const navigateTo = (screen: string) => setActiveScreen(screen)
  const toggleTheme = () => document.documentElement.classList.toggle('dark')
  const toggleLangDropdown = () => setLangDropdownOpen(!langDropdownOpen)
  const setLanguage = (lang: string) => {
    setCurrentLang(lang)
    setLangDropdownOpen(false)
  }

  // Load data from Backend
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [problemsRes, leaderboardRes] = await Promise.all([
        getProblems({ limit: 10 }),
        getLeaderboard({ limit: 10 })
      ])
      
      if (problemsRes.success) setProblems(problemsRes.data || [])
      if (leaderboardRes.success) setLeaderboard(leaderboardRes.data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  // Helper to get difficulty class
  const getDiffClass = (diff: number) => {
    if (diff < 1400) return 'diff-easy'
    if (diff < 1800) return 'diff-medium'
    if (diff < 2400) return 'diff-hard'
    return 'diff-insane'
  }

  return (
    <div className="antialiased min-h-screen">
      {/* Mobile Sidebar Overlay */}
      <div className={`sidebar-overlay ${!sidebarOpen ? 'show' : ''}`} onClick={toggleSidebar}></div>

      {/* Layout Wrapper */}
      <div className="flex h-screen overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-64' : 'sidebar-collapsed'} flex-shrink-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] z-40 transition-all duration-300`}>
          <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)] flex-shrink-0">
            <img src="/logo1.png" alt="SatarnMath" className="h-8 w-auto object-contain" />
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            <button onClick={() => navigateTo('dashboard')} className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeScreen === 'dashboard' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              <span>Dashboard</span>
            </button>
            <button onClick={() => navigateTo('curriculum')} className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeScreen === 'curriculum' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Learn</span>
            </button>
            <button onClick={() => navigateTo('archive')} className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeScreen === 'archive' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              <span>Practice</span>
            </button>
            <button onClick={() => navigateTo('leaderboard')} className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeScreen === 'leaderboard' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>Leaderboard</span>
            </button>
            <button onClick={() => navigateTo('profile')} className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeScreen === 'profile' ? 'active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>Profile</span>
            </button>
          </nav>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 glass flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors lg:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div className="flex-1 max-w-xl">
                <div className="search-input flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 transition-all">
                  <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input type="text" placeholder="Search problems, users, tags..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-primary)]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 ml-3">
              <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              </button>
              
              <div className="relative">
                <button onClick={toggleLangDropdown} className="flag-btn flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-medium">
                  <span className="lang-btn-text text-xs tracking-widest font-bold">{currentLang.toUpperCase()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 card rounded-xl shadow-2xl py-2 z-50">
                    <button onClick={() => setLanguage('en')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)]">English (EN)</button>
                    <button onClick={() => setLanguage('th')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)]">ไทย (TH)</button>
                  </div>
                )}
              </div>

              <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[var(--bg-secondary)] transition-all border border-transparent hover:border-[var(--border-color)] group">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AlexChen" alt="Alex" className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-400 to-violet-500 ring-2 ring-[var(--bg-primary)]" />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold rating-expert leading-tight">Alex_Chen</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight font-mono">2147</div>
                </div>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {/* SCREEN: DASHBOARD */}
            {activeScreen === 'dashboard' && (
              <section className="screen active max-w-6xl mx-auto space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1 font-medium">Welcome back,</p>
                    <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">Alex Chen</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">You are on a <span className="text-neon-400 font-bold">12-day streak</span>. Keep pushing!</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigateTo('archive')} className="btn-primary px-6 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      <span>Practice</span>
                    </button>
                  </div>
                </div>

                {/* Problems List from Database */}
                <div className="card rounded-2xl p-6">
                  <h3 className="font-bold text-[var(--text-primary)] text-base mb-6">Recommended Problems</h3>
                  {loading ? (
                    <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {problems.map((p) => (
                        <div key={p.id} className="card rounded-xl p-5 hover:border-electric-500/40 transition-all cursor-pointer group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono text-[var(--text-tertiary)] flex-shrink-0 font-medium">{p.code}</span>
                              <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors text-sm truncate">{p.title}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getDiffClass(p.difficulty)}`}>{p.level}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {p.tags.map((tag: string) => (
                              <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                            <span className="font-mono">{p.difficulty} rating</span>
                            <span>{p._count.submissions} solved</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* SCREEN: LEADERBOARD */}
            {activeScreen === 'leaderboard' && (
              <section className="screen active max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Global Leaderboard</h1>
                <div className="card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                          <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Country</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Rating</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Solved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {leaderboard.map((u) => (
                          <tr key={u.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                            <td className={`px-6 py-4 font-bold ${u.rank <= 3 ? 'text-gold-400' : 'text-[var(--text-primary)]'}`}>#{u.rank}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full bg-[var(--bg-secondary)]" />
                                <span className="font-semibold text-sm">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-lg">{u.country}</td>
                            <td className="px-6 py-4 font-bold text-sm">{u.rating}</td>
                            <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">{u.solvedCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
