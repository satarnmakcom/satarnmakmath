import prisma from "@/lib/prisma"

export default async function AdminDashboardPage() {
  const usersCount = await prisma.user.count()
  const problemsCount = await prisma.problem.count()
  const submissionsCount = await prisma.submission.count()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-4xl font-extrabold text-[var(--text-primary)]">{usersCount}</p>
        </div>
        <div className="card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Total Problems</h3>
          <p className="text-4xl font-extrabold text-[var(--text-primary)]">{problemsCount}</p>
        </div>
        <div className="card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Submissions</h3>
          <p className="text-4xl font-extrabold text-[var(--text-primary)]">{submissionsCount}</p>
        </div>
      </div>
    </div>
  )
}
