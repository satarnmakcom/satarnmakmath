'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [data, setData] = useState({ name: "", email: "", password: "", otp: "" })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  const handleSendOtp = async () => {
    if (!data.email) {
      setError("Please enter your email address first")
      return
    }

    setSendingOtp(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Failed to send OTP")
      } else {
        setMessage(json.message || "OTP sent to your email!")
      }
    } catch (err) {
      setError("An unexpected error occurred while sending OTP")
    } finally {
      setSendingOtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

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
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15] 
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-emerald-500/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.1, 0.2, 0.1],
          y: [0, -40, 0]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-cyan-600/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none"
      />
      
      {/* Subtle Math Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="glass rounded-[2rem] p-8 sm:p-10 border border-[var(--glass-border)] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
          
          <div className="mb-10 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(16,185,129,0.25)] mb-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              
              {/* CSS Art: Create Account Icon (instead of SVG) */}
              <div 
                role="img" 
                aria-label="Create Account Icon" 
                className="relative z-10 flex flex-col items-center justify-center gap-[3px] w-full h-full transform group-hover:scale-110 transition-transform duration-300"
              >
                {/* CSS Head */}
                <div className="w-4 h-4 rounded-full bg-white shadow-sm border-b border-black/10 dark:border-white/20"></div>
                {/* CSS Shoulders */}
                <div className="w-[22px] h-[10px] rounded-t-full bg-white shadow-sm border-t border-white/40 dark:border-white/20 relative">
                  {/* CSS Plus Badge */}
                  <div className="absolute -right-1 -top-2 w-[14px] h-[14px] bg-cyan-200 dark:bg-cyan-800 rounded-full flex items-center justify-center border-2 border-emerald-500 dark:border-emerald-600 shadow-sm">
                    <div className="w-[6px] h-[2px] bg-emerald-700 dark:bg-cyan-100 absolute rounded-sm"></div>
                    <div className="w-[2px] h-[6px] bg-emerald-700 dark:bg-cyan-100 absolute rounded-sm"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] font-heading">
              Create Account
            </h2>
            <p className="mt-2 text-[var(--text-secondary)] text-sm font-medium">
              Join the world-class learning platform
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
              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl p-3.5 text-center font-medium overflow-hidden"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="peer w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder-transparent"
                  placeholder="Alex Chen"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-4 top-2 text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-emerald-500 pointer-events-none"
                >
                  Full Name
                </label>
              </div>

              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="peer w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder-transparent"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-4 top-2 text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-emerald-500 pointer-events-none"
                >
                  Email address
                </label>
              </div>

              <div className="relative flex gap-2">
                <div className="relative group flex-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    className="peer w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder-transparent tracking-widest"
                    placeholder="123456"
                    value={data.otp}
                    onChange={(e) => setData({ ...data, otp: e.target.value.replace(/\D/g, '') })}
                  />
                  <label 
                    htmlFor="otp" 
                    className="absolute left-4 top-2 text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-emerald-500 pointer-events-none"
                  >
                    Code
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !data.email}
                  className="px-5 shrink-0 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--border-color)] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {sendingOtp ? "Sending" : "Send OTP"}
                </button>
              </div>

              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="peer w-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 pt-6 pb-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder-transparent"
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-4 top-2 text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-emerald-500 pointer-events-none"
                >
                  Password
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 peer-focus:opacity-100 transition-opacity">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-bold">Min 6 chars</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create free account"
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
                <span className="px-3 bg-transparent text-[var(--text-tertiary)] font-medium backdrop-blur-md">or sign up with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]/40 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-emerald-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-color)] group"
              >
                {/* CSS Art: Custom Abstract Logo for Third-Party Login (instead of SVG) */}
                <div 
                  role="img" 
                  aria-label="Google Social Login" 
                  className="relative w-5 h-5 group-hover:scale-110 transition-transform flex flex-wrap gap-[2px] justify-center items-center overflow-hidden rounded-full"
                >
                  <div className="w-[45%] h-[45%] bg-[#EA4335] dark:bg-[#EA4335]/90 rounded-tl-full"></div>
                  <div className="w-[45%] h-[45%] bg-[#34A853] dark:bg-[#34A853]/90 rounded-tr-full"></div>
                  <div className="w-[45%] h-[45%] bg-[#FBBC05] dark:bg-[#FBBC05]/90 rounded-bl-full"></div>
                  <div className="w-[45%] h-[45%] bg-[#4285F4] dark:bg-[#4285F4]/90 rounded-br-full"></div>
                </div>
                Google
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
              Sign in securely
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
