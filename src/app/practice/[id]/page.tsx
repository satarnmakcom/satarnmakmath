'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { submitProblemSolution } from '@/actions/submissions'
import { getProblemById } from '@/actions/problems'
import { selfGradeSolution } from '@/actions/grading'
import { motion, AnimatePresence } from 'framer-motion'

interface Problem {
  id: string
  code: string
  title: string
  content: string
  level: string
  difficulty: number
  tags: string[]
}

export default function ProblemSolverPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [solution, setSolution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [gradeResult, setGradeResult] = useState<{ status: string, ratingDelta: number, newRating: number } | null>(null)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
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
    const res = await submitProblemSolution({
      userId: session.user.id,
      problemId: problem.id,
      content: solution,
    })

    if (res.success && res.data) {
      setSubmissionId(res.data.id)
      setToast({ message: 'Solution submitted! Now grade your answer.', type: 'success' })
    } else {
      setToast({ message: res.error || 'Submission failed', type: 'error' })
    }
    setSubmitting(false)
  }

  const handleGrade = async (isCorrect: boolean) => {
    if (!submissionId || !session?.user?.id) return

    const res = await selfGradeSolution({
      submissionId,
      userId: session.user.id,
      isCorrect,
    })

    if (res.success && res.data) {
      setGradeResult(res.data)
    } else {
      setToast({ message: res.error || 'Grading failed', type: 'error' })
    }
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
          
          <div className="prose dark:prose-invert max-w-none text-sm">
            {problem.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-[var(--text-secondary)] leading-relaxed mb-4">{paragraph}</p>
            ))}
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
            // === GRADE RESULT ===
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center space-y-6 max-w-sm">
                <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl ${
                  gradeResult.status === 'ACCEPTED'
                    ? 'bg-neon-500/15 border-2 border-neon-500/30'
                    : 'bg-rose-500/15 border-2 border-rose-500/30'
                }`}>
                  {gradeResult.status === 'ACCEPTED' ? '✅' : '❌'}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {gradeResult.status === 'ACCEPTED' ? 'Correct!' : 'Incorrect'}
                </h3>
                <div className={`text-4xl font-extrabold ${gradeResult.ratingDelta >= 0 ? 'text-neon-400' : 'text-rose-400'}`}>
                  {gradeResult.ratingDelta >= 0 ? '+' : ''}{gradeResult.ratingDelta}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  New Rating: <span className="font-bold text-[var(--text-primary)]">{gradeResult.newRating}</span>
                </p>
                <Link
                  href="/practice"
                  className="btn-primary inline-block px-6 py-2.5 text-white rounded-xl text-sm font-semibold"
                >
                  Next Problem →
                </Link>
              </div>
            </motion.div>
          ) : submissionId ? (
            // === SELF-GRADE PANEL ===
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center space-y-6 max-w-md">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Grade Your Solution</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Compare your proof with the official solution. Did you solve it correctly?
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleGrade(true)}
                    className="flex-1 max-w-[160px] py-4 rounded-2xl bg-neon-500/10 border-2 border-neon-500/20 hover:border-neon-500/50 text-neon-400 font-bold text-lg transition-all hover:scale-105"
                  >
                    ✅ Correct
                  </button>
                  <button
                    onClick={() => handleGrade(false)}
                    className="flex-1 max-w-[160px] py-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/20 hover:border-rose-500/50 text-rose-400 font-bold text-lg transition-all hover:scale-105"
                  >
                    ❌ Incorrect
                  </button>
                </div>
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
