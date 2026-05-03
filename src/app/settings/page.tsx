'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'

interface SettingsItem {
  icon: string
  label: string
  description: string
  href?: string
  action?: string
  color: string
}

const settingsGroups: { title: string; items: SettingsItem[] }[] = [
  {
    title: 'Account',
    items: [
      {
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        label: 'Edit Profile',
        description: 'Update your name, country, and avatar',
        href: '/profile/edit',
        color: 'electric',
      },
      {
        icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
        label: 'Change Password',
        description: 'Update your login password',
        href: '/settings/password',
        color: 'violet',
      },
    ]
  },
  {
    title: 'Preferences',
    items: [
      {
        icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
        label: 'Appearance',
        description: 'Toggle dark/light mode',
        action: 'theme',
        color: 'gold',
      },
      {
        icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
        label: 'Language',
        description: 'Switch between English and Thai',
        action: 'language',
        color: 'neon',
      },
    ]
  },
]

export default function SettingsPage() {
  const { data: session } = useSession()

  const handleAction = (action: string) => {
    if (action === 'theme') {
      document.documentElement.classList.toggle('dark')
    }
  }

  return (
    <section className="max-w-3xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account and preferences</p>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 px-1">{group.title}</h2>
          <div className="space-y-3">
            {group.items.map((item, i) => {
              const content = (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card rounded-2xl p-5 flex items-center gap-4 hover:border-electric-500/30 transition-all cursor-pointer group"
                  onClick={item.action ? () => handleAction(item.action!) : undefined}
                >
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <svg className={`w-6 h-6 text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors">{item.label}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</div>
                  </div>
                  <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </motion.div>
              )

              if ('href' in item && item.href) {
                return <Link key={item.label} href={item.href}>{content}</Link>
              }
              return content
            })}
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div>
        <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-4 px-1">Session</h2>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full card rounded-2xl p-5 flex items-center gap-4 border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <div className="text-left flex-1">
            <div className="text-sm font-bold text-rose-400">Sign Out</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Signed in as {session?.user?.email}</div>
          </div>
        </button>
      </div>
    </section>
  )
}
