'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { deleteProblem } from '@/actions/admin'

interface Problem {
  id: string
  code: string
  title: string
  level: string
  difficulty: number
}

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function fetchProblems() {
    try {
      const res = await fetch('/api/admin/problems')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setProblems(data)
    } catch (e) {
      setError('Failed to load problems')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProblems() }, [])

  async function handleDelete(id: string) {
    setDeleting(id)
    setConfirmId(null)
    const res = await deleteProblem(id)
    if (res.success) {
      setProblems(prev => prev.filter(p => p.id !== id))
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="p-8 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-4 text-center">🗑️</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">Delete Problem?</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This action cannot be undone. All submissions for this problem will also be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-semibold hover:border-[var(--text-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Problems</h1>
        <Link href="/admin/problems/new" className="btn-primary px-4 py-2 text-white rounded-xl text-sm font-semibold">
          + New Problem
        </Link>
      </div>

      <div className="card rounded-2xl overflow-hidden border border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-6 py-4 font-bold">Title</th>
                <th className="px-6 py-4 font-bold">Level</th>
                <th className="px-6 py-4 font-bold">Difficulty</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {problems.map(problem => (
                <tr key={problem.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)] font-mono">{problem.code}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] max-w-xs truncate">{problem.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-lg">
                      {problem.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-[var(--text-secondary)]">{problem.difficulty}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/practice/${problem.id}`}
                        target="_blank"
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm font-semibold transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/problems/${problem.id}/edit`}
                        className="text-electric-400 hover:text-electric-300 text-sm font-semibold transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setConfirmId(problem.id)}
                        disabled={deleting === problem.id}
                        className="text-rose-400 hover:text-rose-300 text-sm font-semibold transition-colors disabled:opacity-40"
                      >
                        {deleting === problem.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[var(--text-secondary)]">
                    <div className="text-3xl mb-3">📭</div>
                    <p>No problems yet.</p>
                    <Link href="/admin/problems/new" className="mt-3 inline-block text-electric-400 hover:text-electric-300 text-sm font-semibold">
                      + Add your first problem
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {problems.length > 0 && (
          <div className="px-6 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-tertiary)]">{problems.length} problem{problems.length !== 1 ? 's' : ''} total</span>
          </div>
        )}
      </div>
    </div>
  )
}
