"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Problem {
  id: string
  code: string
  title: string
  difficulty: number
}

interface ProblemSetFormProps {
  initialData?: {
    id: string
    title: string
    description: string | null
    timeLimitMinutes: number
    isPublic: boolean
    items: { problemId: string, order: number, problem: Problem }[]
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
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>(
    initialData?.items.sort((a, b) => a.order - b.order).map(i => i.problem) || []
  )

  // Search logic
  const [searchTerm, setSearchTerm] = useState("")
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function search() {
      if (!searchTerm) {
        setAvailableProblems([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/problems?q=${encodeURIComponent(searchTerm)}`)
        const data = await res.json()
        setAvailableProblems(data.slice(0, 10)) // Limit to 10
      } catch (e) {
        console.error(e)
      } finally {
        setSearching(false)
      }
    }
    const t = setTimeout(search, 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  const handleAddProblem = (p: Problem) => {
    if (!selectedProblems.find(sp => sp.id === p.id)) {
      setSelectedProblems([...selectedProblems, p])
    }
    setSearchTerm("")
    setAvailableProblems([])
  }

  const handleRemoveProblem = (id: string) => {
    setSelectedProblems(selectedProblems.filter(p => p.id !== id))
  }

  const moveProblem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= selectedProblems.length) return
    const newArr = [...selectedProblems]
    const temp = newArr[index]
    newArr[index] = newArr[newIndex]
    newArr[newIndex] = temp
    setSelectedProblems(newArr)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setError("Title is required")
      return
    }
    if (selectedProblems.length === 0) {
      setError("Please select at least one problem")
      return
    }

    setLoading(true)
    setError(null)
    
    const res = await onSubmit({
      title,
      description,
      timeLimitMinutes,
      isPublic,
      problemIds: selectedProblems.map(p => p.id)
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

      <div className="card p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
        <h3 className="font-bold text-[var(--text-primary)]">Problems ({selectedProblems.length})</h3>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search problems by code or title to add..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-electric-500 transition-colors"
          />
          {searchTerm && (
            <div className="absolute z-10 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {searching ? (
                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">Searching...</div>
              ) : availableProblems.length > 0 ? (
                <div className="divide-y divide-[var(--border-color)]">
                  {availableProblems.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddProblem(p)}
                      className="w-full text-left p-3 hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-electric-400 text-xs mr-2">{p.code}</span>
                        <span className="text-sm text-[var(--text-primary)]">{p.title}</span>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">+ Add</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">No problems found.</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 mt-4">
          {selectedProblems.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => moveProblem(idx, -1)} disabled={idx === 0} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30">▲</button>
                <button type="button" onClick={() => moveProblem(idx, 1)} disabled={idx === selectedProblems.length - 1} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30">▼</button>
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-electric-400">{p.code}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{p.title}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProblem(p.id)}
                className="text-rose-500 hover:text-rose-400 p-2"
              >
                ✕
              </button>
            </div>
          ))}
          {selectedProblems.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
              No problems added yet. Search above to add some.
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
