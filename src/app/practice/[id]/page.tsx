'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { submitProblemSolution } from '@/actions/submissions'
import { getProblemById } from '@/actions/problems'
import { aiGradeSolution } from '@/actions/grading'
import { toggleBookmark, checkBookmarkStatus } from '@/actions/bookmarks'
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
  hints: string[]
}

interface GradeResult {
  status: string
  ratingDelta: number
  newRating: number
  isRetry?: boolean
  feedback?: string
}

// ---- Custom Resizable Split Pane ----
function ResizableSplitPane({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const [leftPercent, setLeftPercent] = useState(50)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setLeftPercent(Math.min(Math.max(pct, 20), 80))
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div ref={containerRef} className="w-full h-full flex" style={{ overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ width: `${leftPercent}%`, overflow: 'hidden' }} className="h-full">
        {left}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={(e) => {
          e.preventDefault()
          dragging.current = true
          document.body.style.cursor = 'col-resize'
          document.body.style.userSelect = 'none'
        }}
        className="w-1.5 flex-shrink-0 bg-transparent hover:bg-electric-500/50 transition-colors cursor-col-resize flex flex-col justify-center items-center group relative z-10"
        style={{ minWidth: '6px' }}
      >
        <div className="h-8 w-1 rounded-full bg-[var(--border-color)] group-hover:bg-electric-500 transition-colors" />
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflow: 'hidden' }} className="h-full">
        {right}
      </div>
    </div>
  )
}

// ---- Star icon (inline SVG, no @heroicons needed) ----
function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  )
}

export default function ProblemSolverPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
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
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [isAIGrading, setIsAIGrading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Hints state
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    if (!id) return
    async function loadProblem() {
      setLoading(true)
      const [res, bookmarkRes] = await Promise.all([
        getProblemById(id),
        checkBookmarkStatus(id)
      ])
      if (res.success && res.data) {
        setProblem(res.data as any)
      }
      if (bookmarkRes.success) {
        setIsBookmarked(bookmarkRes.bookmarked)
      }
      setLoading(false)
    }
    loadProblem()
  }, [id])

  const handleBookmarkToggle = async () => {
    const res = await toggleBookmark(id)
    if (res.success) {
      setIsBookmarked(res.bookmarked ?? false)
      setToast({ message: res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', type: 'success' })
    }
  }

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

  const handleTryAgain = () => {
    setGradeResult(null)
    setSolution('')
  }

  const handleSubmit = async () => {
    if (!session?.user?.id || !problem || !solution.trim()) {
      setToast({ message: 'Please write your answer before submitting.', type: 'error' })
      return
    }

    setSubmitting(true)
    const res = await submitProblemSolution({
      userId: session.user.id,
      problemId: problem.id,
      content: solution,
    })

    if (res.success && res.data) {
      setToast({ message: 'Submitted! Redirecting to submissions...', type: 'success' })

      // Trigger background grading
      fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: res.data.id,
          userId: session.user.id,
          problemId: problem.id,
          studentProof: solution
        })
      }).catch(console.error)

      // Redirect immediately so user can do other things
      router.push('/submissions')
    } else {
      setToast({ message: res.error || 'Submission failed', type: 'error' })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 flex">
        <div className="w-1/2 p-8 border-r border-[var(--border-color)]">
          <div className="w-32 h-6 bg-[var(--bg-elevated)] rounded-md animate-pulse mb-6"></div>
          <div className="w-64 h-8 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-8"></div>
          <div className="space-y-4">
            <div className="w-full h-4 bg-[var(--bg-elevated)] rounded-md animate-pulse"></div>
            <div className="w-5/6 h-4 bg-[var(--bg-elevated)] rounded-md animate-pulse"></div>
            <div className="w-full h-4 bg-[var(--bg-elevated)] rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="w-1/2 p-8">
           <div className="w-full h-full bg-[var(--bg-elevated)] rounded-xl animate-pulse"></div>
        </div>
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

  // ---- Left panel content ----
  const leftPanel = (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)] p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/practice" className="hover:text-electric-400 transition-colors">Practice</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span className="text-[var(--text-primary)]">{problem.code}</span>
          </div>
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl transition-all ${isBookmarked ? 'bg-gold-500/10 text-gold-400' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
          >
            <StarIcon className="w-5 h-5" filled={isBookmarked} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-electric-500/10 text-electric-400 text-xs font-bold">{problem.level}</span>
          {problem.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-bold">{tag}</span>
          ))}
          <span className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-400 text-xs font-bold">Difficulty: {problem.difficulty}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">{problem.title}</h2>

        <div className="mt-4 prose prose-invert max-w-none text-[var(--text-primary)]">
          <MarkdownRenderer content={problem.content} />
        </div>

        {/* Hints Section */}
        {problem.hints && problem.hints.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span> Hints
            </h3>
            <div className="space-y-3">
              {problem.hints.map((hint, idx) => (
                <div key={idx} className="card rounded-2xl border border-[var(--border-color)] overflow-hidden">
                  <button
                    onClick={() => setHintsRevealed(Math.max(hintsRevealed, idx + 1))}
                    className="w-full px-5 py-3 flex items-center justify-between bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-colors text-left"
                  >
                    <span className="font-bold text-[var(--text-primary)] text-sm">Hint {idx + 1}</span>
                    <span className="text-xs text-[var(--text-tertiary)] font-bold px-2 py-1 bg-[var(--bg-card)] rounded-md border border-[var(--border-color)]">
                      {idx < hintsRevealed ? 'Revealed' : 'Click to reveal'}
                    </span>
                  </button>
                  {idx < hintsRevealed && (
                    <div className="px-5 py-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] prose prose-invert prose-sm">
                      <MarkdownRenderer content={hint} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ---- Right panel content ----
  const rightPanel = (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Toolbar */}
      <div className="px-5 py-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="timer-digit font-mono font-bold text-[var(--text-primary)] text-base">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-3">
          {!gradeResult && !isAIGrading && (
            <div className="flex bg-[var(--bg-primary)] rounded-lg p-0.5 border border-[var(--border-color)]">
              <button
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${!isPreview ? 'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
              >
                Write
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${isPreview ? 'bg-[var(--bg-secondary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
              >
                Preview
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {gradeResult ? (
              <button
                onClick={handleTryAgain}
                className="px-4 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 text-xs font-semibold transition-all"
              >
                ↺ Try Again
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || isAIGrading}
                className="btn-primary px-4 py-1.5 rounded-lg text-white text-xs font-semibold disabled:opacity-50"
              >
                {submitting || isAIGrading ? 'Evaluating...' : 'Submit & Grade'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor or Grade Panel */}
      <div className="flex-1 p-4 flex flex-col overflow-y-auto">
        {gradeResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col justify-center items-center py-4 px-4"
          >
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-xl ${
                  gradeResult.status === 'ACCEPTED'
                    ? 'bg-gradient-to-br from-neon-500/20 to-neon-500/5 border border-neon-500/30'
                    : 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30'
                }`}>
                  {gradeResult.status === 'ACCEPTED' ? '✨' : '💡'}
                </div>
                <h3 className={`text-3xl font-extrabold tracking-tight mb-2 ${
                  gradeResult.status === 'ACCEPTED' ? 'text-neon-400' : 'text-rose-400'
                }`}>
                  {gradeResult.status === 'ACCEPTED' ? 'Brilliant!' : 'Not Quite There'}
                </h3>

                {gradeResult.isRetry ? (
                  <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <span className="text-sm text-[var(--text-tertiary)]">Practice mode — rating unchanged</span>
                  </div>
                ) : (
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
                )}
              </div>

              {/* AI Feedback Card */}
              <div className={`p-5 rounded-2xl border backdrop-blur-sm ${
                gradeResult.status === 'ACCEPTED'
                  ? 'bg-neon-500/5 border-neon-500/20 shadow-[0_0_30px_rgba(52,211,153,0.08)]'
                  : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.08)]'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className={`w-4 h-4 shrink-0 ${gradeResult.status === 'ACCEPTED' ? 'text-neon-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <h4 className={`font-bold text-xs uppercase tracking-wider ${gradeResult.status === 'ACCEPTED' ? 'text-neon-400' : 'text-rose-400'}`}>
                    AI Evaluation
                  </h4>
                </div>
                <div className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-none prose prose-invert prose-p:my-1">
                  <MarkdownRenderer content={gradeResult.feedback || 'Your solution was graded based on mathematical correctness.'} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-electric-500/50 text-[var(--text-primary)] font-bold rounded-xl transition-all hover:scale-105 text-sm"
                >
                  ↺ Try Again
                </button>
                <Link
                  href="/practice"
                  className="px-6 py-2.5 bg-electric-500/10 border border-electric-500/30 hover:border-electric-500/60 text-electric-400 font-bold rounded-xl transition-all hover:scale-105 text-sm"
                >
                  Next Problem →
                </Link>
              </div>
            </div>
          </motion.div>
        ) : isAIGrading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-electric-500/20 animate-pulse absolute inset-0 blur-xl"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-500 to-violet-500 flex items-center justify-center shadow-2xl relative z-10">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-violet-400 animate-pulse">
                AI is analyzing your answer...
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">Checking mathematical correctness</p>
            </div>
          </motion.div>
        ) : isPreview ? (
          <div className="w-full flex-1 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl overflow-y-auto shadow-sm">
            {solution ? (
              <MarkdownRenderer content={solution} />
            ) : (
              <p className="text-[var(--text-tertiary)] text-sm italic">Nothing to preview. Go to Write mode to type your answer.</p>
            )}
          </div>
        ) : (
          <textarea
            className="w-full flex-1 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm resize-none outline-none focus:border-electric-500/50 focus:shadow-md transition-all shadow-sm"
            placeholder={problem.level === 'POSN'
              ? 'Type your answer here. Use $...$ for math formulas (e.g. $\\frac{1}{2}$)...'
              : 'Write your full proof here. Use $$...$$ for block math equations...'}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
          />
        )}
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-8rem)] -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 overflow-hidden bg-[var(--bg-primary)]">
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

      {/* DESKTOP: Custom Resizable Split Pane */}
      <div className="hidden lg:block h-full">
        <ResizableSplitPane left={leftPanel} right={rightPanel} />
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden flex flex-col h-full overflow-y-auto">
         <div className="p-6 border-b border-[var(--border-color)]">
             <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{problem.title}</h2>
             <MarkdownRenderer content={problem.content} />
         </div>
         <div className="flex-1 flex flex-col p-4 bg-[var(--bg-secondary)] min-h-[400px]">
             <textarea
              className="w-full flex-1 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm resize-none outline-none focus:border-electric-500/50 shadow-sm"
              placeholder="Write your answer here..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                disabled={submitting || isAIGrading}
                className="mt-4 btn-primary w-full py-3 rounded-xl text-white font-bold disabled:opacity-50"
              >
                {submitting || isAIGrading ? 'Evaluating...' : 'Submit & Grade'}
              </button>
         </div>
      </div>
    </div>
  )
}
