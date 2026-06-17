"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { startAttempt, submitAttempt } from "@/actions/problemSets"
import { aiGradeAttempt } from "@/actions/grading"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { useLanguage } from "@/context/LanguageContext"

const LANG_SEP = '---LANG:TH---'
function getLocalizedContent(content: string, lang: string): string {
  const idx = content.indexOf(LANG_SEP)
  if (idx === -1) return content
  const en = content.slice(0, idx).trim()
  const th = content.slice(idx + LANG_SEP.length).trim()
  return lang === 'th' && th ? th : en
}

interface ContestClientProps {
  problemSet: any
  attempt: any
  session: any
}

export default function ContestClient({ problemSet, attempt, session }: ContestClientProps) {
  const router = useRouter()
  const { update } = useSession()
  const { language } = useLanguage()
  const [currentAttempt, setCurrentAttempt] = useState<any>(attempt)
  // answers keyed by item.id (ProblemSetItem ID)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(problemSet.timeLimitMinutes * 60)
  const [loading, setLoading] = useState(false)
  const [isGrading, setIsGrading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize time left if in progress
  useEffect(() => {
    if (currentAttempt && currentAttempt.status === "IN_PROGRESS") {
      const elapsed = Math.floor((Date.now() - new Date(currentAttempt.startedAt).getTime()) / 1000)
      const remaining = Math.max(0, (problemSet.timeLimitMinutes * 60) - elapsed)
      setTimeLeft(remaining)

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentAttempt, problemSet.timeLimitMinutes])

  // Resume grading if stuck in SUBMITTED state
  useEffect(() => {
    if (currentAttempt && currentAttempt.status === "SUBMITTED" && !isGrading) {
      // Auto-trigger grading if it got stuck previously
      triggerAIGrading(currentAttempt.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAttempt?.status])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (!session) {
      router.push("/login")
      return
    }
    setLoading(true)
    const res = await startAttempt(problemSet.id)
    if (res.success) {
      setCurrentAttempt(res.data)
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const submitExam = async () => {
    if (!currentAttempt) return
    setLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const answerArr = Object.entries(answers).map(([problemId, content]) => ({
      problemId,
      content
    }))

    const res = await submitAttempt(currentAttempt.id, answerArr)
    if (res.success && res.data) {
      setCurrentAttempt(res.data)
      triggerAIGrading(res.data.id)
    } else {
      alert(res.error)
      setLoading(false)
    }
  }

  const handleManualSubmit = () => {
    if (confirm("Are you sure you want to submit your exam? You cannot change answers after submitting.")) {
      submitExam()
    }
  }

  const handleAutoSubmit = () => {
    alert("Time is up! Submitting your answers automatically.")
    submitExam()
  }

  const triggerAIGrading = async (attemptId: string) => {
    setIsGrading(true)
    const res = await aiGradeAttempt(attemptId)
    if (res.success) {
      setCurrentAttempt(res.data)
      // Refresh session so rating in Profile/Dashboard syncs immediately
      await update()
    } else {
      alert(res.error || "Failed to grade exam")
    }
    setIsGrading(false)
    setLoading(false)
  }

  // --- RENDERING ---

  if (!currentAttempt) {
    return (
      <div className="max-w-5xl mx-auto" style={{paddingTop: '4rem', paddingBottom: '6rem'}}>

        {/* Top row: label + badge */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-[0.12em] bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-color)]">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse inline-block"></span>
              POSN Series
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--text-tertiary)] tracking-widest uppercase">Pre-Exam Briefing</span>
        </div>

        {/* Main title block */}
        <div className="mb-12">
          <h1
            className="font-black tracking-tighter text-[var(--text-primary)] leading-none select-none"
            style={{
              fontSize: 'clamp(5rem, 14vw, 10rem)',
              letterSpacing: '-0.04em',
            }}
          >
            {problemSet.title}
          </h1>
          {problemSet.description && (
            <p className="mt-5 text-base text-[var(--text-secondary)] max-w-xl leading-relaxed font-medium">
              {problemSet.description}
            </p>
          )}
        </div>

        {/* Divider + Spec Bar */}
        <div className="border-t border-[var(--border-color)] mb-0" />
        <div className="grid grid-cols-3 divide-x divide-[var(--border-color)] border-b border-[var(--border-color)] mb-12">
          
          {/* Spec: Time */}
          <div className="py-8 px-6 group">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Time Limit</span>
            </div>
            <div className="font-black text-[var(--text-primary)] tabular-nums" style={{fontSize: '2.5rem', letterSpacing: '-0.03em', lineHeight: 1}}>
              {problemSet.timeLimitMinutes}
              <span className="text-lg font-semibold text-[var(--text-tertiary)] ml-1.5">min</span>
            </div>
          </div>

          {/* Spec: Questions */}
          <div className="py-8 px-6 group">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Questions</span>
            </div>
            <div className="font-black text-[var(--text-primary)] tabular-nums" style={{fontSize: '2.5rem', letterSpacing: '-0.03em', lineHeight: 1}}>
              {problemSet.items.length}
              <span className="text-lg font-semibold text-[var(--text-tertiary)] ml-1.5">Qs</span>
            </div>
          </div>

          {/* Spec: Grading */}
          <div className="py-8 px-6 group">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Grading</span>
            </div>
            <div className="font-black tabular-nums" style={{fontSize: '2.5rem', letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--accent)'}}>
              AI
              <span className="text-lg font-semibold text-[var(--text-tertiary)] ml-1.5">powered</span>
            </div>
          </div>
        </div>

        {/* CTA Row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-tertiary)] max-w-xs leading-relaxed">
            Once started, the timer cannot be paused. Ensure you have a stable connection.
          </p>
          <div className="flex items-center gap-4">
            {!session ? (
              <button
                onClick={() => router.push("/login")}
                className="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{background: 'linear-gradient(135deg, #3B82F6, #6366F1)', boxShadow: '0 2px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'}}
              >
                <span>Login to Start</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={loading}
                className="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{background: 'linear-gradient(135deg, #3B82F6, #6366F1)', boxShadow: '0 2px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'}}
              >
                <span>{loading ? 'Preparing...' : 'Start Attempt'}</span>
                {!loading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    )
  }

  if (currentAttempt.status === "SUBMITTED" || isGrading) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-electric-500/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-electric-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-electric-400 mb-2">Exam Submitted Successfully!</h2>
        <p className="text-[var(--text-secondary)] mb-6">AI is grading your exam in the background. You can wait here for the results, or leave this page and check your profile later.</p>
        <button onClick={() => router.push('/contests')} className="btn-secondary px-8 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
          Back to Contests
        </button>
      </div>
    )
  }

  if (currentAttempt.status === "GRADED") {
    const submissions = currentAttempt.submissions || []
    const acceptedCount = submissions.filter((s: any) => s.status === "ACCEPTED").length

    return (
      <div className="max-w-4xl mx-auto py-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-electric-500/10 dark:bg-electric-500/20 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-soft" />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-electric-500 mb-2 drop-shadow-sm">Exam Results</h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8">{problemSet.title}</p>

          <div className="flex justify-center gap-6 relative z-10">
            <div className="card p-8 rounded-2xl border border-[var(--glass-border)] min-w-[180px] shadow-[0_10px_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 relative z-10">Final Score</div>
              <div className="text-5xl font-extrabold text-electric-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] relative z-10">{acceptedCount} <span className="text-2xl text-[var(--text-secondary)]">/ {problemSet.items.length}</span></div>
            </div>
            <div className="card p-8 rounded-2xl border border-[var(--glass-border)] min-w-[180px] shadow-[0_10px_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 relative z-10">Rating Change</div>
              <div className={`text-5xl font-extrabold relative z-10 ${(currentAttempt.score ?? 0) >= 0 ? 'text-neon-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]'}`}>
                {(currentAttempt.score ?? 0) > 0 ? '+' : ''}{currentAttempt.score ?? 0}
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Submission Details</h3>
        <div className="space-y-6">
          {problemSet.items.map((item: any, idx: number) => {
            // Match submission by problemId
            const sub = submissions.find((s: any) => s.problemId === item.problemId)
            const isCorrect = sub?.status === "ACCEPTED"
            return (
              <div key={item.id} className={`card p-6 rounded-2xl border ${isCorrect ? 'border-neon-500/30' : 'border-rose-500/30'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[var(--text-primary)]">Question {idx + 1}</h4>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${isCorrect ? 'bg-neon-500/10 text-neon-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isCorrect ? 'Correct' : sub ? 'Incorrect' : 'No Answer'}
                  </span>
                </div>

                <div className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                  <MarkdownRenderer content={getLocalizedContent(item.problem.content, language)} />
                </div>

                <div>
                  <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Your Answer</p>
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl font-mono text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                    {sub?.content || "No answer provided"}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12 flex justify-center gap-4">
          <button onClick={() => router.push('/contests')} className="btn-secondary px-8 py-3 rounded-xl font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            Back to Contests
          </button>
          <button onClick={handleStart} disabled={loading} className="btn-primary px-8 py-3 rounded-xl text-white font-bold disabled:opacity-50">
            {loading ? "Starting..." : "Retake Exam"}
          </button>
        </div>
      </div>
    )
  }

  // IN_PROGRESS STATE
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8 bg-[var(--bg-primary)]">
      {/* Top Bar */}
      <div className="bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-electric-500 text-lg hidden md:block">{problemSet.title}</h1>
          <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Exam in progress</div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono font-bold text-2xl ${timeLeft < 300 ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse' : 'text-[var(--text-primary)] drop-shadow-sm'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold disabled:opacity-50 shadow-electric-500/25"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {problemSet.items.map((item: any, idx: number) => (
            <div key={item.id} className="card bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex items-center justify-between">
                <h3 className="font-bold text-[var(--text-primary)]">Question {idx + 1}</h3>
                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                  <span className="font-mono font-medium">{item.problem.level}</span>
                  <span>•</span>
                  <span>⭐ {item.problem.difficulty}</span>
                </div>
              </div>
              <div className="p-6">
                <MarkdownRenderer content={getLocalizedContent(item.problem.content, language)} />

                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Your Answer</label>
                  <textarea
                    value={answers[item.problemId] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [item.problemId]: e.target.value }))}
                    placeholder={item.problem.level === 'POSN' ? "Type short answer here..." : "Type full proof/solution here..."}
                    className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 font-mono text-sm text-[var(--text-primary)] outline-none focus:border-electric-500 resize-y transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
