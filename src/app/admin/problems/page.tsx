import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function AdminProblemsPage() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: "desc" }
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
                    <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">{problem.code}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{problem.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-lg">
                        {problem.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-[var(--text-secondary)]">{problem.difficulty}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/problems/${problem.id}/edit`} className="text-electric-400 hover:text-electric-300 text-sm font-semibold">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      No problems found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  } catch (e: any) {
    return <div className="p-8 bg-red-100 text-red-900 border border-red-300 rounded-xl"><h1>Problems Page Error:</h1><pre className="whitespace-pre-wrap">{e.stack || e.message}</pre></div>
  }
}
