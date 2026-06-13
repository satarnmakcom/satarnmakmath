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
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">{problemSet.title}</h1>
        {problemSet.description && <p className="text-[var(--text-secondary)] mb-8">{problemSet.description}</p>}

        <div className="card p-8 rounded-2xl border border-[var(--border-color)] inline-block text-left mb-8">
          <h3 className="font-bold text-[var(--text-primary)] mb-4 text-center">Exam Info</h3>
          <ul className="space-y-3 text-[var(--text-secondary)]">
            <li className="flex items-center gap-3">
              <span className="text-2xl">⏳</span> Time Limit: <b>{problemSet.timeLimitMinutes} Minutes</b>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">📝</span> Total Problems: <b>{problemSet.items.length} Questions</b>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">🤖</span> AI Auto-grading upon submission
            </li>
          </ul>
        </div>

        <div>
          {!session ? (
            <button onClick={() => router.push("/login")} className="btn-primary px-8 py-3 rounded-xl text-white font-bold text-lg">
              Login to Start
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary px-8 py-3 rounded-xl text-white font-bold text-lg disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Attempt"}
            </button>
          )}
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
        <h2 className="text-2xl font-bold text-electric-400 mb-2">AI is grading your exam...</h2>
        <p className="text-[var(--text-secondary)]">Please wait while the AI analyzes all your answers. This may take a few moments.</p>
      </div>
    )
  }

  if (currentAttempt.status === "GRADED") {
    const submissions = currentAttempt.submissions || []
    const acceptedCount = submissions.filter((s: any) => s.status === "ACCEPTED").length

    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-2">Exam Results</h1>
          <p className="text-[var(--text-secondary)] mb-8">{problemSet.title}</p>

          <div className="flex justify-center gap-6">
            <div className="card p-6 rounded-2xl border border-[var(--border-color)] min-w-[150px]">
              <div className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Score</div>
              <div className="text-3xl font-extrabold text-electric-400">{acceptedCount} / {problemSet.items.length}</div>
            </div>
            <div className="card p-6 rounded-2xl border border-[var(--border-color)] min-w-[150px]">
              <div className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Rating Change</div>
              <div className={`text-3xl font-extrabold ${(currentAttempt.score ?? 0) >= 0 ? 'text-neon-400' : 'text-rose-400'}`}>
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

        <div className="text-center mt-12">
          <button onClick={() => router.push('/contests')} className="btn-primary px-8 py-3 rounded-xl text-white font-bold">
            Back to Contests
          </button>
        </div>
      </div>
    )
  }

  // IN_PROGRESS STATE
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8">
      {/* Top Bar */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="font-bold text-[var(--text-primary)] text-lg hidden md:block">{problemSet.title}</h1>
          <div className="text-xs text-[var(--text-secondary)]">Mock Exam in progress</div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-xl text-white font-bold disabled:opacity-50"
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
