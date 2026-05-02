'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [data, setData] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Failed to register")
        setLoading(false)
        return
      }

      // Auto login after successful registration
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInRes?.error) {
        setError("Account created, but failed to login automatically")
        setLoading(false)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 card p-8 md:p-10 rounded-3xl border border-[var(--border-color)] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Join the world-class Math Olympiad platform
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl p-3 text-center font-medium">
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="Alex Chen"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="you@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <p className="mt-1.5 text-[10px] text-[var(--text-tertiary)] font-medium">Must be at least 6 characters</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>

        <div className="mt-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--bg-card)] text-[var(--text-tertiary)] font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-[var(--border-color)] rounded-xl shadow-sm bg-[var(--bg-secondary)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-color)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)] relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
