'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const json = await res.json()

      if (res.ok) {
        setSent(true)
      } else {
        setError(json.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 card p-8 md:p-10 rounded-3xl border border-[var(--border-color)] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gold-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {sent ? 'Check Your Email' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {sent
              ? 'If an account exists with that email, we\'ve sent a reset link.'
              : 'Enter your email and we\'ll send you a reset link.'
            }
          </p>
        </div>

        {!sent ? (
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl p-3 text-center font-medium">
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2" htmlFor="reset-email">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-gold-400 to-orange-500 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center relative z-10 mt-6">
            <div className="text-6xl mb-4">📬</div>
            <Link
              href="/login"
              className="text-sm font-bold text-electric-400 hover:text-electric-300 transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)] relative z-10">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-electric-400 hover:text-electric-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
