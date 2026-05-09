'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [data, setData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
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
        <div className="absolute top-0 right-0 w-48 h-48 bg-electric-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-electric-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Log in to continue your journey on Satarnmak Math
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
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="you@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-electric-400 hover:text-electric-300 transition-colors">Forgot password?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-electric-500 to-violet-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-500 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
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
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-electric-400 hover:text-electric-300 transition-colors">
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
