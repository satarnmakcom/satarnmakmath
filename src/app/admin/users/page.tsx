import prisma from "@/lib/prisma"
import Link from "next/link"
import AdminUserActions from "@/components/AdminUserActions"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { rating: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">User Management</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm font-medium">Manage all platform users, roles, and bans.</p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/60 border-b border-[var(--border-color)]">
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">User</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Stats</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Joined</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                        className="w-10 h-10 rounded-full border border-[var(--border-color)] object-cover"
                        alt="" 
                      />
                      <div>
                        <Link href={`/user/${encodeURIComponent(user.name || user.id)}`} className="text-sm font-bold text-[var(--text-primary)] hover:text-electric-500 transition-colors">
                          {user.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {user.role === "ADMIN" && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-electric-500/10 text-electric-500 border border-electric-500/20 rounded">Admin</span>
                          )}
                          {user.isBanned && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 rounded">Banned</span>
                          )}
                          {!user.isBanned && user.role !== "ADMIN" && (
                            <span className="text-xs text-[var(--text-tertiary)]">User</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{user.rating} <span className="text-[10px] font-normal text-[var(--text-tertiary)] uppercase tracking-widest">Rating</span></div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{user.streak} day streak</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-[var(--text-secondary)]">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end">
                      <AdminUserActions 
                        userId={user.id} 
                        currentRole={user.role} 
                        isBanned={user.isBanned} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
