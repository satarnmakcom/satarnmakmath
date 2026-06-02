import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import AdminSidebar from "./components/AdminSidebar"

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
      <div className="flex h-screen w-full bg-[var(--bg-secondary)]">
        <AdminSidebar />

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
