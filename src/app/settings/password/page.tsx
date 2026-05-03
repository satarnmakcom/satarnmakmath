'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { changePassword } from '@/actions/profile'

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' })
      return
    }
    if (newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' })
      return
    }
    if (!session?.user?.id) return

    setSaving(true)
    const res = await changePassword(session.user.id, { currentPassword, newPassword })

    if (res.success) {
      setToast({ message: 'Password changed successfully!', type: 'success' })
      setTimeout(() => router.push('/settings'), 1500)
    } else {
      setToast({ message: res.error || 'Failed to change password', type: 'error' })
    }
    setSaving(false)
  }

  return (
    <section className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Change Password</h1>
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

      <form onSubmit={handleSubmit} className="card rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Current Password</label>
          <input
            type="password"
            required
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Confirm New Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        <div className="flex items-center justify-between gap-4">
          <Link href="/settings" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  )
}
