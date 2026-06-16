'use client'

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [data, setData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

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
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-electric-500/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
          y: [0, -30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-violet-600/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none"
      />
      
      {/* Subtle Math Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="glass rounded-[2rem] p-8 sm:p-10 border border-[var(--glass-border)] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
          
          <div className="mb-10 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="w-16 h-16 bg-gradient-to-tr from-electric-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(99,102,241,0.25)] mb-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
              Welcome back
            </h2>
            <p className="mt-2 text-[var(--text-secondary)] text-sm font-medium">
              Log in to continue your journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl p-3.5 text-center font-medium overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="peer w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-1 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all placeholder-transparent"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-4 top-2 text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-electric-500 pointer-events-none"
                >
                  Email address
                </label>
              </div>

              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="peer w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-1 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all placeholder-transparent"
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-4 top-2 text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-electric-500 pointer-events-none"
                >
                  Password
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Link href="/forgot-password" className="text-[13px] font-semibold text-[var(--text-tertiary)] hover:text-electric-400 transition-colors">
                    Forgot?
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-electric-600 to-violet-600 hover:from-electric-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(59,130,246,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in to account"
                )}
              </span>
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-color)]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-transparent text-[var(--text-tertiary)] font-medium backdrop-blur-md">or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/40 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-electric-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-color)] group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-electric-500 hover:text-electric-400 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
