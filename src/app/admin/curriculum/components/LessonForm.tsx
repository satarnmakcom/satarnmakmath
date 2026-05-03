'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LessonFormProps {
  backHref: string
  initialData?: {
    title: string
    content: string
    order: number
    videoUrl?: string | null
  }
  onSubmit: (data: {
    title: string
    content: string
    order: number
    videoUrl?: string
  }) => Promise<{ success: boolean; error?: string }>
  isEditing?: boolean
}

export default function LessonForm({ backHref, initialData, onSubmit, isEditing = false }: LessonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    order: initialData?.order || 1,
    videoUrl: initialData?.videoUrl || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await onSubmit({
      title: formData.title,
      content: formData.content,
      order: formData.order,
      videoUrl: formData.videoUrl || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isEditing ? 'Edit Lesson' : 'New Lesson'}
        </h1>
        <div className="flex gap-3">
          <Link href={backHref} className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Lesson'}
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
          <div className="card p-6 rounded-2xl space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Lesson Title</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Introduction to Modular Arithmetic"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Content (Markdown + LaTeX)</label>
              <textarea
                required
                rows={20}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-electric-500/50 transition-all resize-y"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write lesson content here. LaTeX like $x^2$ and $$\int_a^b f(x)dx$$ is supported."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 rounded-2xl space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Order (within module)</label>
              <input
                type="number"
                required
                min={1}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Video URL (Optional)</label>
              <input
                type="url"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-500/50 transition-all"
                value={formData.videoUrl}
                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
