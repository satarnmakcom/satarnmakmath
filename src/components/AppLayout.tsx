'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { LanguageProvider } from '@/context/LanguageContext'
import { useSession } from 'next-auth/react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // Show landing page without app chrome (sidebar/header)
  const isLandingPage = pathname === '/' && status === 'unauthenticated'

  // Admin pages use their own full-screen layout — no main sidebar/header
  const isAdminPage = pathname.startsWith('/admin')

  if (!mounted) {
    return (
      <div className="antialiased min-h-screen bg-[var(--bg-primary)]">
        <div className="flex h-screen overflow-hidden">
          <div className="hidden md:block w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]" />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]" />
          </div>
        </div>
      </div>
    )
  }

  // Landing page: render children directly without sidebar/header
  if (isLandingPage) {
    return (
      <LanguageProvider>
        <div className="antialiased min-h-screen bg-[var(--bg-primary)]">
          {children}
        </div>
      </LanguageProvider>
    )
  }

  // Admin pages: full screen, no main sidebar or header
  if (isAdminPage) {
    return (
      <LanguageProvider>
        <div className="antialiased min-h-screen bg-[var(--bg-secondary)]">
          {children}
        </div>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <div className="antialiased min-h-screen bg-[var(--bg-primary)]">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Layout Wrapper */}
        <div className="flex h-screen overflow-hidden relative">
          {/* LEFT SIDEBAR */}
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          {/* MAIN AREA */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative w-full">
            {/* Top Navigation Bar */}
            <Header 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

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
    </LanguageProvider>
  )
}
