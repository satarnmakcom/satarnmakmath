'use client'

import { useState } from 'react'
import { adminUpdateRating } from '@/actions/users'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AdminRatingEditor({ userId, currentRating, isAdmin }: { userId: string, currentRating: number, isAdmin: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(currentRating)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  if (!isAdmin) return null

  const handleSave = async () => {
    setLoading(true)
    const res = await adminUpdateRating(userId, rating)
    setLoading(false)
    if (res.success) {
      toast.success("Rating updated successfully!")
      setIsEditing(false)
      await update({ rating: rating })
      router.refresh()
    } else {
      toast.error(res.error || "Failed to update rating")
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <input 
          type="number" 
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-sm text-[var(--text-primary)] focus:outline-none focus:border-electric-500"
        />
        <button onClick={handleSave} disabled={loading} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        </button>
        <button onClick={() => setIsEditing(false)} className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setIsEditing(true)} className="ml-2 p-1 rounded-md text-[var(--text-tertiary)] hover:text-electric-400 hover:bg-white/5 transition-colors" title="Edit Rating (Admin)">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    </button>
  )
}
