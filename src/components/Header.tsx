'use client'

import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  currentLang?: string
  onLanguageChange?: (lang: string) => void
}

export default function Header({ currentLang = 'en', onLanguageChange }: HeaderProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  const toggleTheme = () => {
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
        <div className="flex-1 max-w-xl">
          <div className="search-input flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 transition-all">
            <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text" 
              placeholder={currentLang === 'th' ? 'ค้นหาโจทย์, ผู้ใช้, แท็ก...' : 'Search problems, users, tags...'} 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-primary)] placeholder-[var(--text-tertiary)]" 
            />
            <span className="text-[10px] text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-md px-1.5 py-0.5 hidden sm:block font-mono">⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-3">
        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all hover:scale-105">
          <svg className="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg className="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <div className="relative">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)} 
            className="flag-btn flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <span className="lang-btn-text text-xs tracking-widest font-bold">{currentLang.toUpperCase()}</span>
            <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 card rounded-xl shadow-2xl py-2 z-50 border border-[var(--border-color)] overflow-hidden">
              <button onClick={() => setLanguage('en')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">English</div>
                  <div className="text-xs text-[var(--text-tertiary)]">EN</div>
                </div>
              </button>
              <button onClick={() => setLanguage('th')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">ไทย</div>
                  <div className="text-xs text-[var(--text-tertiary)]">TH</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <button className="relative p-2.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-all hover:scale-105">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-electric-500 rounded-full ring-2 ring-[var(--bg-primary)]"></span>
        </button>

        <Link href="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-[var(--bg-secondary)] transition-all border border-transparent hover:border-[var(--border-color)] group">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AlexChen" alt="Alex" className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-400 to-violet-500 ring-2 ring-[var(--bg-primary)] group-hover:scale-105 transition-transform"/>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold rating-expert leading-tight group-hover:text-electric-400 transition-colors">Alex_Chen</div>
            <div className="text-[10px] text-[var(--text-tertiary)] leading-tight font-mono">2147</div>
          </div>
        </Link>
      </div>
    </header>
  )
}
