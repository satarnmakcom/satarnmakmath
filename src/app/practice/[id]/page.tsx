'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutes in seconds

  useEffect(() => {
    // Mock problem data - in production this would fetch from API
    const mockProblem: Problem = {
      id,
      code: 'TMO2565-P4',
      title: 'Cyclic Quadrilateral Perpendiculars',
      content: `Let $ABCD$ be a cyclic quadrilateral inscribed in circle $\\Gamma$. Let $P$ be the intersection of diagonals $AC$ and $BD$. Let $E$ and $F$ be the feet of perpendiculars from $P$ to sides $AB$ and $CD$ respectively.

Prove that line $EF$ is perpendicular to the line connecting the midpoints of $AD$ and $BC$.`,
      level: 'HARD',
      difficulty: 1800,
      tags: ['Geometry', 'Cyclic Quadrilaterals']
    }
    setProblem(mockProblem)
    setLoading(false)
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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
            <button className="btn-primary px-4 py-1.5 rounded-lg text-white text-xs font-semibold">
              Submit
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          <textarea 
            className="w-full h-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm resize-none outline-none focus:border-electric-500/50 focus:shadow-md transition-all shadow-sm" 
            placeholder="Write your proof in LaTeX..."
          />
        </div>
      </div>
    </div>
  )
}
