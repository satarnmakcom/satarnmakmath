'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CompetitionLevel } from '@prisma/client'

interface ModuleFormProps {
  moduleId?: string
  backHref: string
  initialData?: {
    title: string
    description?: string | null
    level: CompetitionLevel
    order: number
  }
  onSubmit: (data: {
    title: string
    description?: string
    level: CompetitionLevel
    order: number
  }) => Promise<{ success: boolean; error?: string }>
  isEditing?: boolean
}

const LEVELS = Object.values(CompetitionLevel)

export default function ModuleForm({ backHref, initialData, onSubmit, isEditing = false }: ModuleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    level: initialData?.level || 'POSN' as CompetitionLevel,
    order: initialData?.order || 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await onSubmit({
      ...formData,
      description: formData.description || undefined,
    })

    if (res.success) {
      router.push(backHref)
      router.refresh()
    } else {
      setError(res.error || 'Failed to save')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isEditing ? 'Edit Module' : 'New Module'}
        </h1>
        <div className="flex gap-3">
          <Link href={backHref} className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Module'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-semibold border border-rose-500/20">
          {error}
        </div>
      )}

      <div className="card p-6 rounded-2xl space-y-5">
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Title</label>
          <input
            type="text"
            required
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Basic Algebra"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Description</label>
          <textarea
            rows={3}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Short description of this module..."
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Level</label>
            <select
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
              value={formData.level}
              onChange={e => setFormData({ ...formData, level: e.target.value as CompetitionLevel })}
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Order</label>
            <input
              type="number"
              required
              min={1}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
