import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AdminRatingEditor from "@/components/AdminRatingEditor"
import { getRatingInfo } from "@/lib/rating"

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { id },
        { name: decodeURIComponent(id) }
      ]
    },
    include: {
      submissions: {
        where: { status: "ACCEPTED" },
        include: { problem: true },
        orderBy: { submittedAt: 'desc' },
        take: 10
      }
    }
  })

  if (!user) {
    notFound()
  }

  const ratingInfo = getRatingInfo(user.rating)

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Hero Banner */}
      <div className="card rounded-3xl overflow-hidden relative mb-8">
        <div className="h-48 md:h-60 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
          <div className="hero-glow bg-electric-500 top-[-150px] right-[5%]"></div>
          <div className="hero-glow bg-violet-500 bottom-[-100px] left-[10%]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.12) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-card)] to-transparent"></div>

          {/* Floating Stats on Banner */}
          <div className="absolute top-6 right-6 md:right-10 flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
              <div className={`text-lg font-bold ${ratingInfo.className}`}>{ratingInfo.title}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Rank</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
              <div className="text-lg font-bold text-neon-400">{user.rating}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Rating</div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-14 md:-mt-16">
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-electric-400 via-violet-500 to-violet-600 p-[3px] shadow-2xl">
                <img src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`} className="w-full h-full rounded-2xl bg-[var(--bg-card)] object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-lg">
                <span className="text-lg">🇹🇭</span>
              </div>
            </div>
            <div className="flex-1 mb-0 md:mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className={`text-2xl md:text-4xl tracking-tight ${ratingInfo.className}`}>{user.name || "Anonymous"}</h1>
                <span className={`px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm text-xs ${ratingInfo.className}`}>{ratingInfo.title}</span>
                <AdminRatingEditor userId={user.id} currentRating={user.rating} isAdmin={isAdmin} />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  @{user.email ? user.email.split('@')[0] : "user"}
                </span>
                <span className="text-[var(--text-tertiary)]">•</span>
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 md:col-span-1">
          <div className="card rounded-3xl p-6 border border-[var(--border-color)] shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="text-xl">🏆</span> Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-secondary)]">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Global Rank</span>
                <span className="font-bold text-[var(--text-primary)]">#{user.globalRank || '?'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-secondary)]">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Problems Solved</span>
                <span className="font-bold text-electric-400">{user.submissions.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-secondary)]">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Current Streak</span>
                <span className="font-bold text-neon-400">{user.streak} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Solves */}
        <div className="md:col-span-2 space-y-6">
          <div className="card rounded-3xl p-6 border border-[var(--border-color)] shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span> Recent Activity
            </h3>
            
            <div className="space-y-3">
              {user.submissions.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border-color)]">
                  <span className="text-3xl mb-2 block">😴</span>
                  <p>No problems solved yet.</p>
                </div>
              ) : (
                user.submissions.map((sub) => (
                  <Link href={`/practice/${sub.problem.code}`} key={sub.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-electric-500/30 transition-all group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-electric-500 bg-electric-500/10 px-2 py-0.5 rounded-md">
                          {sub.problem.code}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)] font-medium">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-[var(--text-primary)] group-hover:text-electric-400 transition-colors">
                        {sub.problem.title}
                      </h4>
                    </div>
                    <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      Accepted
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
