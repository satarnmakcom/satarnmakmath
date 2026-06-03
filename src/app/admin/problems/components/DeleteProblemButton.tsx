'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProblem } from '@/actions/admin'

export default function DeleteProblemButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const res = await deleteProblem(id)
    if (res.success) {
      router.refresh()
    }
    setDeleting(false)
    setConfirm(false)
  }

  return (
    <>
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-4 text-center">🗑️</div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-2">Delete Problem?</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This action cannot be undone. All submissions for this problem will also be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-semibold hover:border-[var(--text-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setConfirm(true)}
        className="text-rose-400 hover:text-rose-300 text-sm font-semibold transition-colors"
      >
        Delete
      </button>
    </>
  )
}
