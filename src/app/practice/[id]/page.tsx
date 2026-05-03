'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { submitProblemSolution } from '@/actions/submissions'
import { getProblemById } from '@/actions/problems'
import { aiGradeSolution } from '@/actions/grading'
import { motion, AnimatePresence } from 'framer-motion'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface Problem {
  id: string
  code: string
  title: string
  content: string
  level: string
  difficulty: number
  tags: string[]
}

export default function ProblemSolverPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('')
  
  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  const { data: session, update } = useSession()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [solution, setSolution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [gradeResult, setGradeResult] = useState<{ status: string, ratingDelta: number, newRating: number, feedback?: string } | null>(null)
  const [isAIGrading, setIsAIGrading] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (!id) return
    async function loadProblem() {
      setLoading(true)
      const res = await getProblemById(id)
      if (res.success && res.data) {
        setProblem(res.data as any)
      }
      setLoading(false)
    }
    loadProblem()
  }, [id])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!session?.user?.id || !problem || !solution.trim()) {
      setToast({ message: 'Please write your solution before submitting.', type: 'error' })
      return
    }

    setSubmitting(true)
    // 1. Submit the solution
    const res = await submitProblemSolution({
      userId: session.user.id,
      problemId: problem.id,
      content: solution,
    })

    if (res.success && res.data) {
      setSubmissionId(res.data.id)
      setToast({ message: 'Solution submitted! AI is now evaluating...', type: 'success' })
      
      // 2. Trigger AI Grading
      setIsAIGrading(true)
      const gradeRes = await aiGradeSolution({
        submissionId: res.data.id,
        userId: session.user.id,
        problemId: problem.id,
        studentProof: solution
      })

      if (gradeRes.success && gradeRes.data) {
        setGradeResult(gradeRes.data)
        // Refresh the session token so the profile and header show the new rating
        await update()
      } else {
        setToast({ message: gradeRes.error || 'AI Grading failed', type: 'error' })
      }
      setIsAIGrading(false)
    } else {
      setToast({ message: res.error || 'Submission failed', type: 'error' })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Problem Not Found</h2>
        <Link href="/practice" className="text-electric-400 hover:text-electric-500 mt-4 inline-block">
          Back to Practice
        </Link>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 flex flex-col lg:flex-row">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-neon-500/15 text-neon-400 border-neon-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Problem Statement */}
      <div className="lg:w-1/2 h-1/2 lg:h-full overflow-y-auto p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[var(--border-color)]">
        <div className="max-w-xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
            <Link href="/practice" className="hover:text-electric-400 transition-colors">Practice</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span className="text-[var(--text-primary)]">{problem.code}</span>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-electric-500/10 text-electric-400 text-xs font-bold">{problem.code.split('-')[0]}</span>
            {problem.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-bold">{tag}</span>
            ))}
            <span className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-400 text-xs font-bold">{problem.difficulty}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">{problem.title}</h2>
          
          <div className="mt-4">
            <MarkdownRenderer content={problem.content} />
          </div>
        </div>
      </div>

      {/* Solution Editor */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col bg-[var(--bg-secondary)]">
        {/* Toolbar */}
        <div className="px-5 py-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="timer-digit font-mono font-bold text-[var(--text-primary)] text-base">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-semibold transition-all">
              Hint
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting || !!submissionId}
              className="btn-primary px-4 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : submissionId ? 'Submitted ✓' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Editor or Grade Panel */}
        <div className="flex-1 p-4 flex flex-col">
          {gradeResult ? (
            // === AI EVALUATION RESULT ===
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center items-center py-8 px-4"
            >
              <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 shadow-xl ${
                    gradeResult.status === 'ACCEPTED'
                      ? 'bg-gradient-to-br from-neon-500/20 to-neon-500/5 border border-neon-500/30 text-neon-400'
                      : 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30 text-rose-400'
                  }`}>
                    {gradeResult.status === 'ACCEPTED' ? '✨' : '💡'}
                  </div>
                  <h3 className={`text-3xl font-extrabold tracking-tight mb-2 ${
                    gradeResult.status === 'ACCEPTED' ? 'text-neon-400' : 'text-rose-400'
                  }`}>
                    {gradeResult.status === 'ACCEPTED' ? 'Brilliant Solution!' : 'Not Quite There'}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-4 py-2 rounded-xl">
                      <span className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-1">Rating Change</span>
                      <span className={`text-xl font-bold ${gradeResult.ratingDelta >= 0 ? 'text-neon-400' : 'text-rose-400'}`}>
                        {gradeResult.ratingDelta >= 0 ? '+' : ''}{gradeResult.ratingDelta}
                      </span>
                    </div>
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-4 py-2 rounded-xl">
                      <span className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-1">New Rating</span>
                      <span className="text-xl font-bold text-[var(--text-primary)]">{gradeResult.newRating}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  gradeResult.status === 'ACCEPTED' 
                    ? 'bg-neon-500/5 border-neon-500/20 shadow-[0_0_30px_rgba(52,211,153,0.1)]' 
                    : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className={`w-5 h-5 ${gradeResult.status === 'ACCEPTED' ? 'text-neon-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    <h4 className={`font-bold text-sm uppercase tracking-wider ${gradeResult.status === 'ACCEPTED' ? 'text-neon-400' : 'text-rose-400'}`}>
                      AI Evaluation
                    </h4>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
                    {gradeResult.feedback || "Your solution was graded based on mathematical correctness."}
                  </p>
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href="/practice"
                    className="inline-block px-8 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-electric-500/50 text-[var(--text-primary)] font-bold rounded-xl transition-all hover:scale-105"
                  >
                    Back to Arena
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : isAIGrading ? (
            // === AI GRADING LOADING STATE ===
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-electric-500/20 animate-pulse absolute inset-0 blur-xl"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-500 to-violet-500 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                   <svg className="w-8 h-8 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-violet-400 animate-pulse">
                  AI is analyzing your proof...
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">Checking logic and mathematical rigor</p>
              </div>
            </motion.div>
          ) : (
            // === TEXTAREA EDITOR ===
            <textarea 
              className="w-full flex-1 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm resize-none outline-none focus:border-electric-500/50 focus:shadow-md transition-all shadow-sm" 
              placeholder="Write your proof in LaTeX..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
