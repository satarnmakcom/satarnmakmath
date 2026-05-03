import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== "ADMIN") {
      redirect("/")
    }

    return (
      <div className="flex h-[calc(100vh-4rem)] -mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8 bg-[var(--bg-secondary)]">
        {/* Admin Sidebar */}
        <div className="w-64 bg-[var(--bg-primary)] border-r border-[var(--border-color)] flex flex-col hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin Panel</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Manage platform content</p>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link href="/admin" className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Overview
            </Link>
            <Link href="/admin/problems" className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Problems
            </Link>
            <Link href="/admin/curriculum" className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Curriculum
            </Link>
          </nav>
        </div>

        {/* Admin Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    )
  } catch (e: any) {
    if (e.message === 'NEXT_REDIRECT') throw e; // Let Next.js handle redirects
    return <div className="p-8 bg-red-100 text-red-900 border border-red-300 rounded-xl"><h1>Admin Layout Error:</h1><pre className="whitespace-pre-wrap">{e.stack || e.message}</pre></div>
  }
}
