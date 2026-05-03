"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface InlineProblem {
  id?: string
  problemId?: string
  content: string
  level: "POSN" | "POSN1" | "POSN2" | "TMO" | "IMO"
  difficulty: number
}

interface ProblemSetFormProps {
  initialData?: {
    id: string
    title: string
    description: string | null
    timeLimitMinutes: number
    isPublic: boolean
    items: { id: string, problemId: string, content: string, level: any, difficulty: number, order: number }[]
  }
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>
  isEditing?: boolean
}

export default function ProblemSetForm({ initialData, onSubmit, isEditing }: ProblemSetFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialData?.timeLimitMinutes || 90)
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false)
  const [problems, setProblems] = useState<InlineProblem[]>(
    initialData?.items.sort((a, b) => a.order - b.order).map(i => ({
      id: i.id,
      problemId: i.problemId,
      content: i.content,
      level: i.level,
      difficulty: i.difficulty
    })) || []
  )

  const handleAddProblem = () => {
    setProblems([...problems, { content: "", level: "POSN", difficulty: 1200 }])
  }

  const handleRemoveProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index))
  }

  const updateProblem = (index: number, field: keyof InlineProblem, value: any) => {
    const newProblems = [...problems]
    newProblems[index] = { ...newProblems[index], [field]: value }
    setProblems(newProblems)
  }

  const moveProblem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= problems.length) return
    const newArr = [...problems]
    const temp = newArr[index]
    newArr[index] = newArr[newIndex]
    newArr[newIndex] = temp
    setProblems(newArr)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setError("Title is required")
      return
    }
    if (problems.length === 0) {
      setError("Please add at least one problem")
      return
    }
    if (problems.some(p => !p.content.trim())) {
      setError("All problems must have content")
      return
    }

    setLoading(true)
    setError(null)
    
    const res = await onSubmit({
      title,
      description,
      timeLimitMinutes,
      isPublic,
      problems
    })

    if (res.success) {
      router.push("/admin/problem-sets")
      router.refresh()
    } else {
      setError(res.error || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="card p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
        <h3 className="font-bold text-[var(--text-primary)]">General Info</h3>
        
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors"
            placeholder="e.g. POSN Mock Exam #1"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Time Limit (Minutes)</label>
            <input
              type="number"
              value={timeLimitMinutes}
              onChange={e => setTimeLimitMinutes(Number(e.target.value))}
              min={1}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors"
            />
          </div>
          
          <div className="flex-1 flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded bg-[var(--bg-secondary)] border-[var(--border-color)] text-electric-500 focus:ring-electric-500"
              />
              <span className="text-sm font-bold text-[var(--text-primary)]">Publish (Publicly visible)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card p-6 rounded-2xl border border-[var(--border-color)] space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[var(--text-primary)]">Problems ({problems.length})</h3>
          <button
            type="button"
            onClick={handleAddProblem}
            className="text-xs font-bold bg-electric-500/10 text-electric-500 hover:bg-electric-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add Question
          </button>
        </div>

        <div className="space-y-6">
          {problems.map((p, idx) => (
            <div key={idx} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => moveProblem(idx, -1)} disabled={idx === 0} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30">▲</button>
                    <button type="button" onClick={() => moveProblem(idx, 1)} disabled={idx === problems.length - 1} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30">▼</button>
                  </div>
                  <span className="font-bold text-[var(--text-primary)]">Question {idx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProblem(idx)}
                  className="text-rose-500 hover:text-rose-400 p-2"
                >
                  ✕ Remove
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Problem Statement (Markdown supported)</label>
                <textarea
                  value={p.content}
                  onChange={e => updateProblem(idx, "content", e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors font-mono text-sm"
                  placeholder="Type your problem here..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Level / Grading Rules</label>
                  <select
                    value={p.level}
                    onChange={e => updateProblem(idx, "level", e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors"
                  >
                    <option value="POSN">POSN (Short Answer - Final answer only)</option>
                    <option value="POSN1">POSN 1 (Requires Proof)</option>
                    <option value="POSN2">POSN 2 (Requires Proof)</option>
                    <option value="TMO">TMO (Requires Proof)</option>
                    <option value="IMO">IMO (Requires Proof)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Difficulty / Base Rating</label>
                  <input
                    type="number"
                    value={p.difficulty}
                    onChange={e => updateProblem(idx, "difficulty", Number(e.target.value))}
                    min={800}
                    step={100}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
          {problems.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
              No questions added yet. Click "+ Add Question" to start.
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 rounded-xl text-white font-bold disabled:opacity-50"
      >
        {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Problem Set"}
      </button>
    </form>
  )
}
