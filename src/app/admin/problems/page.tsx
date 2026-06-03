import prisma from '@/lib/prisma'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteProblemButton from './components/DeleteProblemButton'

export const revalidate = 0 // always fresh for admin

export default async function AdminProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      title: true,
      level: true,
      difficulty: true,
    }
  })

  return (
    <div className="space-y-6">
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
                        href={`/practice/${problem.code}`}
                        target="_blank"
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm font-semibold transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/problems/${problem.id}/edit`}
                        className="text-[#60a5fa] hover:text-[#93c5fd] text-sm font-semibold transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteProblemButton id={problem.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[var(--text-secondary)]">
                    <div className="text-3xl mb-3">📭</div>
                    <p>No problems yet.</p>
                    <Link href="/admin/problems/new" className="mt-3 inline-block text-[#60a5fa] hover:text-[#93c5fd] text-sm font-semibold">
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
