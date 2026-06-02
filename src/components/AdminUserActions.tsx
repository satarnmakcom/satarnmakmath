"use client"

import { useState } from "react"
import { toggleUserRole, toggleUserBan } from "@/actions/admin"

export default function AdminUserActions({ 
  userId, 
  currentRole, 
  isBanned 
}: { 
  userId: string
  currentRole: string
  isBanned: boolean 
}) {
  const [loading, setLoading] = useState(false)

  const handleToggleRole = async () => {
    if (!confirm(`Are you sure you want to change this user's role to ${currentRole === "ADMIN" ? "USER" : "ADMIN"}?`)) return
    
    setLoading(true)
    const res = await toggleUserRole(userId)
    if (!res.success) {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleToggleBan = async () => {
    if (!confirm(`Are you sure you want to ${isBanned ? "unban" : "ban"} this user?`)) return
    
    setLoading(true)
    const res = await toggleUserBan(userId)
    if (!res.success) {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 items-center mt-3">
      <button 
        onClick={handleToggleRole}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
          currentRole === "ADMIN" 
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" 
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
        } disabled:opacity-50`}
      >
        {currentRole === "ADMIN" ? "Demote from Admin" : "Promote to Admin"}
      </button>

      <button 
        onClick={handleToggleBan}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
          isBanned 
            ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20" 
            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
        } disabled:opacity-50`}
      >
        {isBanned ? "Unban Account" : "Ban Account"}
      </button>
    </div>
  )
}
