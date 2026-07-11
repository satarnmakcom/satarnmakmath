'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { updateProfile } from '@/actions/profile'

import { countries } from '@/lib/countries'

export default function EditProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [name, setName] = useState(session?.user?.name || '')
  const [country, setCountry] = useState('TH')
  const [image, setImage] = useState<string | null>(session?.user?.image || null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSaving(true)
    const res = await updateProfile(session.user.id, { name, country, image: image || undefined })

    if (res.success) {
      await update()
      setToast({ message: 'Profile updated successfully!', type: 'success' })
      setTimeout(() => router.push('/profile'), 1500)
    } else {
      setToast({ message: res.error || 'Failed to update', type: 'error' })
    }
    setSaving(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file.', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Compress to webp base64
          const dataUrl = canvas.toDataURL('image/webp', 0.8)
          setImage(dataUrl)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Edit Profile</h1>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold border ${
            toast.type === 'success'
              ? 'bg-neon-500/10 text-neon-400 border-neon-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="card rounded-2xl p-6 md:p-8 space-y-6">
        {/* Avatar Preview & Upload */}
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer">
            <img
              src={image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`}
              className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] object-cover"
              alt="Avatar"
            />
            <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-[var(--text-tertiary)] mb-2">{session?.user?.email}</p>
            <label className="text-xs text-neon-500 hover:text-neon-400 font-bold cursor-pointer transition-colors">
              Change Picture
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all"
            placeholder="Your name"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500/50 transition-all cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="h-px bg-[var(--border-color)]" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/profile" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
