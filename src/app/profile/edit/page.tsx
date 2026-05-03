'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { updateProfile } from '@/actions/profile'

const countries = [
  { code: 'TH', name: 'Thailand 🇹🇭' },
  { code: 'US', name: 'United States 🇺🇸' },
  { code: 'JP', name: 'Japan 🇯🇵' },
  { code: 'KR', name: 'South Korea 🇰🇷' },
  { code: 'CN', name: 'China 🇨🇳' },
  { code: 'SG', name: 'Singapore 🇸🇬' },
  { code: 'VN', name: 'Vietnam 🇻🇳' },
  { code: 'IN', name: 'India 🇮🇳' },
  { code: 'GB', name: 'United Kingdom 🇬🇧' },
  { code: 'DE', name: 'Germany 🇩🇪' },
  { code: 'FR', name: 'France 🇫🇷' },
  { code: 'AU', name: 'Australia 🇦🇺' },
  { code: 'OTHER', name: 'Other 🌍' },
]

export default function EditProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState(session?.user?.name || '')
  const [country, setCountry] = useState('TH')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSaving(true)
    const res = await updateProfile(session.user.id, { name, country })

    if (res.success) {
      setToast({ message: 'Profile updated successfully!', type: 'success' })
      setTimeout(() => router.push('/profile'), 1500)
    } else {
      setToast({ message: res.error || 'Failed to update', type: 'error' })
    }
    setSaving(false)
  }

  return (
    <section className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Edit Profile</h1>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold border ${
            toast.type === 'success'
              ? 'bg-neon-500/10 text-neon-400 border-neon-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="card rounded-2xl p-6 md:p-8 space-y-6">
        {/* Avatar Preview */}
        <div className="flex items-center gap-5">
          <img
            src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`}
            className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)]"
            alt=""
          />
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{session?.user?.email}</p>
          </div>
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all"
            placeholder="Your name"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/profile" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
