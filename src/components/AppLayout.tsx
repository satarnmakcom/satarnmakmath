'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [currentLang, setCurrentLang] = useState('en')

  return (
    <div className="antialiased min-h-screen">
      {/* Layout Wrapper */}
      <div className="flex h-screen overflow-hidden">
        {/* LEFT SIDEBAR */}
        <Sidebar currentLang={currentLang} />

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navigation Bar */}
          <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
