'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

const features = [
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    title: 'Structured Practice',
    desc: 'Curated problem sets from POSN to IMO level, organized by topic and difficulty rating.',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Adaptive Rating',
    desc: 'Elo-based rating system that adapts to your skill. Compete and climb the global leaderboard.',
    gradient: 'from-violet-500 to-purple-400',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    title: 'Full Curriculum',
    desc: 'Complete learning pathways with theory lessons, worked examples, and progressive challenges.',
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Live Leaderboard',
    desc: 'Track your progress against the community. See who dominates each topic and difficulty tier.',
    gradient: 'from-amber-500 to-orange-400',
    glow: 'rgba(245,158,11,0.15)',
  },
]

const stats = [
  { value: '500+', label: 'Problems' },
  { value: '1,200+', label: 'Users' },
  { value: '6', label: 'Difficulty Tiers' },
  { value: '∞', label: 'Possibilities' },
]

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState(target)
  return <span>{display}{suffix}</span>
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-primary)]">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[150px] transition-all duration-[2000ms]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            left: `calc(${mousePos.x * 0.02}% + 10%)`,
            top: `calc(${mousePos.y * 0.02}% - 20%)`,
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            right: '5%',
            bottom: '10%',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
            left: '50%',
            top: '60%',
          }}
        />
      </div>

      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-6 md:px-10 lg:px-16 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gradient">SatarnMath</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-xl hover:bg-white/5"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 md:pt-24 pb-20 md:pb-32">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-emerald-400">Platform Active — Join the community</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] max-w-5xl mx-auto mb-6"
          style={{ fontFamily: 'var(--font-outfit), var(--font-inter), sans-serif' }}
        >
          <span className="text-[var(--text-primary)]">Master </span>
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Mathematics</span>
          <br />
          <span className="text-[var(--text-primary)]">Like Never Before</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10"
        >
          A world-class competitive mathematics platform. From POSN to IMO — structured curricula, 
          adaptive ratings, and a global community pushing the boundaries of problem solving.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/register"
            className="group relative px-8 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Practicing — It&apos;s Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/learn"
            className="px-8 py-4 text-base font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-2xl border border-[var(--border-color)] hover:border-white/20 hover:bg-white/[0.03] transition-all"
          >
            Explore Curriculum
          </Link>
        </motion.div>

        {/* Floating Math Formulas - decorative */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[8%] text-2xl md:text-3xl font-mono text-white/[0.04] font-bold select-none"
          >
            ∑ₙ₌₁
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -3, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[25%] right-[10%] text-xl md:text-2xl font-mono text-white/[0.04] font-bold select-none"
          >
            ∫₀^∞
          </motion.div>
          <motion.div
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-[30%] left-[15%] text-xl md:text-2xl font-mono text-white/[0.04] font-bold select-none"
          >
            π·e^(iθ)
          </motion.div>
          <motion.div
            animate={{ y: [5, -15, 5], rotate: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-[40%] right-[18%] text-lg md:text-xl font-mono text-white/[0.04] font-bold select-none"
          >
            lim x→∞
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-20 md:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-1 rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
        >
          {stats.map((s, i) => (
            <div key={i} className="p-6 md:p-8 text-center border-white/[0.04] relative group hover:bg-white/[0.03] transition-colors"
              style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-1 tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
                {s.value}
              </div>
              <div className="text-xs md:text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-20 md:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
            Everything You Need to
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"> Excel</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Built by math olympiad veterans for the next generation of problem solvers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 md:p-8 overflow-hidden hover:border-white/[0.12] transition-all duration-500 cursor-default"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(600px circle at 50% 0%, ${f.glow}, transparent 70%)` }}
              />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PROBLEM PREVIEW ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-20 md:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-gradient-to-r from-violet-500 to-purple-500">IMO 2024</span>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">Problem 3</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Functional Equations on ℤ</h3>
          </div>
          <div className="p-6 md:p-8 font-mono text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            <p>Let f : ℤ → ℤ be a function such that for all integers m, n:</p>
            <div className="my-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-[var(--text-primary)] text-base md:text-lg">
              f(2a) + 2f(b) = f(f(a + b))
            </div>
            <p>Find all such functions f.</p>
          </div>
          <div className="px-6 md:px-8 pb-6 md:pb-8 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                45 min avg
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                142 solved
              </span>
            </div>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20"
            >
              Try It →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20 md:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/20 to-purple-600/20 blur-xl" />
          <div className="relative border border-white/[0.08] rounded-3xl bg-white/[0.03] backdrop-blur-md p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
              Ready to Begin?
            </h2>
            <p className="text-base md:text-lg text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
              Join thousands of students and competitors leveling up their mathematical thinking every day.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-[0.98] transition-all"
            >
              Create Free Account
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[var(--text-secondary)]">SatarnMath</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            © 2026 SatarnMath. Empowering mathematical minds worldwide.
          </p>
          <div className="flex items-center gap-5 text-xs text-[var(--text-tertiary)]">
            <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-[var(--text-primary)] transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
