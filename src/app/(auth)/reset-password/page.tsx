'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const json = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(json.error || 'Reset failed')
      }
    } catch {
      setError('Network error')
    }

    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[var(--text-secondary)]">Invalid or missing reset token.</p>
          <Link href="/forgot-password" className="text-electric-400 font-bold">Request a new link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 card p-8 md:p-10 rounded-3xl border border-[var(--border-color)] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-electric-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {success ? 'Password Reset!' : 'New Password'}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {success ? 'Redirecting to login...' : 'Enter your new password below.'}
          </p>
        </div>

        {!success ? (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl p-3 text-center font-medium">
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Confirm Password</label>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-electric-500 to-violet-600 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center text-6xl mt-6">✅</div>
        )}
      </motion.div>
    </div>
  )
}
