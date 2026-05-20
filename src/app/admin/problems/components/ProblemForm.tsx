'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CompetitionLevel } from '@prisma/client'

interface ProblemFormProps {
  initialData?: {
    id?: string
    code: string
    title: string
    content: string
    level: CompetitionLevel
    difficulty: number
    tags: string[]
    hints?: string[]
  }
  onSubmit: (data: any) => Promise<{ success: boolean, error?: string }>
  isEditing?: boolean
}

export default function ProblemForm({ initialData, onSubmit, isEditing = false }: ProblemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    level: initialData?.level || 'POSN',
    difficulty: initialData?.difficulty || 1200,
    tags: initialData?.tags?.join(', ') || '',
    hints: initialData?.hints || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)

    const res = await onSubmit({
      ...formData,
      difficulty: Number(formData.difficulty),
      tags: tagsArray,
      hints: formData.hints.filter(h => h.trim() !== '')
    })

    if (res.success) {
      router.push('/admin/problems')
    } else {
      setError(res.error || 'Failed to save problem')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isEditing ? 'Edit Problem' : 'Create New Problem'}
        </h1>
        <div className="flex gap-3">
          <Link href="/admin/problems" className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Problem'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-semibold border border-rose-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Content (LaTeX Supported)</label>
              <textarea
                required
                rows={15}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            
            {/* Hints Section */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Hints</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hints: [...formData.hints, ''] })}
                  className="text-xs px-3 py-1 rounded-lg bg-electric-500/10 text-electric-400 font-bold hover:bg-electric-500/20 transition-colors"
                >
                  + Add Hint
                </button>
              </div>
              <div className="space-y-3">
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 mt-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-xs font-bold text-[var(--text-tertiary)]">
                      {index + 1}
                    </span>
                    <textarea
                      rows={2}
                      className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all resize-y font-mono"
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...formData.hints]
                        newHints[index] = e.target.value
                        setFormData({ ...formData, hints: newHints })
                      }}
                      placeholder={`Hint ${index + 1} (LaTeX supported)`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newHints = formData.hints.filter((_, i) => i !== index)
                        setFormData({ ...formData, hints: newHints })
                      }}
                      className="flex-shrink-0 mt-2 w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.hints.length === 0 && (
                  <div className="text-sm text-[var(--text-tertiary)] text-center py-4 bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-color)]">
                    No hints added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. TMO-2565-P1"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Level</label>
              <select
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value as CompetitionLevel })}
              >
                {Object.values(CompetitionLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Difficulty Rating</label>
              <input
                type="number"
                required
                min={800}
                max={4000}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Tags (Comma separated)</label>
              <input
                type="text"
                placeholder="Geometry, Number Theory"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
