'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [currentLang, setCurrentLang] = useState('en')
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="antialiased min-h-screen bg-[var(--bg-primary)]">
        <div className="flex h-screen overflow-hidden">
          <div className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]" />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="antialiased min-h-screen bg-[var(--bg-primary)]">
      {/* Layout Wrapper */}
      <div className="flex h-screen overflow-hidden">
        {/* LEFT SIDEBAR */}
        <Sidebar currentLang={currentLang} />

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Navigation Bar */}
          <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="min-h-full p-4 md:p-6 lg:p-8"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
