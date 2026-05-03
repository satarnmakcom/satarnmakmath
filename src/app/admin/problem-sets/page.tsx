import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function AdminProblemSetsPage() {
  const sets = await prisma.problemSet.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true, attempts: true } }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Problem Sets</h1>
        <Link href="/admin/problem-sets/new" className="btn-primary px-4 py-2 text-white rounded-xl text-sm font-semibold">
          + New Problem Set
        </Link>
      </div>

      <div className="card rounded-2xl overflow-hidden border border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="px-6 py-4 font-bold">Title</th>
                <th className="px-6 py-4 font-bold">Time Limit</th>
                <th className="px-6 py-4 font-bold">Problems</th>
                <th className="px-6 py-4 font-bold">Visibility</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {sets.map(set => (
                <tr key={set.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">{set.title}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{set.timeLimitMinutes} mins</td>
                  <td className="px-6 py-4 text-sm font-mono text-[var(--text-secondary)]">{set._count.items}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${set.isPublic ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {set.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/problem-sets/${set.id}/edit`} className="text-electric-400 hover:text-electric-300 text-sm font-semibold">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {sets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No problem sets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
