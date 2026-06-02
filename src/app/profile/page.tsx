'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"
import AdminRatingEditor from "@/components/AdminRatingEditor"
import { useLanguage } from "@/context/LanguageContext"
import { getRatingInfo } from "@/lib/rating"

const achievements = [
  { id: 'welcome', icon: 'fire', color: 'gold', title: 'Welcome to Satarnmak Math', locked: false },
  { id: 'solver', icon: 'lock', color: 'electric', title: 'Problem Solver', locked: true },
  { id: 'geometry', icon: 'lock', color: 'violet', title: 'Geometry Wizard', locked: true },
  { id: 'speed', icon: 'lock', color: 'neon', title: 'Speed Demon', locked: true },
  { id: 'consistent', icon: 'lock', color: 'rose', title: 'Consistent', locked: true },
  { id: 'grandmaster', icon: 'lock', color: 'orange', title: 'Grandmaster', locked: true },
]

const skills = [
  { name: 'Algebra', level: 'Unrated', progress: 0, color: 'electric' },
  { name: 'Geometry', level: 'Unrated', progress: 0, color: 'violet' },
  { name: 'Number Theory', level: 'Unrated', progress: 0, color: 'orange' },
  { name: 'Combinatorics', level: 'Unrated', progress: 0, color: 'emerald' },
]

const colorMap: Record<string, { from: string; to: string }> = {
  electric: { from: 'from-electric-500', to: 'to-electric-400' },
  violet: { from: 'from-violet-500', to: 'to-violet-400' },
  orange: { from: 'from-orange-500', to: 'to-orange-400' },
  emerald: { from: 'from-emerald-500', to: 'to-emerald-400' }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const user = session?.user
  const ratingInfo = getRatingInfo(user?.rating || 1200)
  const { t } = useLanguage()

  const handleShare = () => {
    if (typeof window !== 'undefined' && user) {
      const url = `${window.location.origin}/user/${encodeURIComponent(user.name || user.id || '')}`
      navigator.clipboard.writeText(url)
      toast.success(t('profile.share'))
    }
  }

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="card rounded-3xl overflow-hidden relative">
        <div className="h-48 md:h-60 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
          <div className="hero-glow bg-electric-500 top-[-150px] right-[5%]"></div>
          <div className="hero-glow bg-violet-500 bottom-[-100px] left-[10%]"></div>
          <div className="hero-glow bg-neon-500 top-[20%] left-[40%] opacity-10"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.12) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-card)] to-transparent"></div>

          {/* Floating Stats on Banner */}
          <div className="absolute top-6 right-6 md:right-10 flex gap-3 z-10">
            <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center hover:bg-white/20 transition-all shadow-xl">
              <div className={`text-lg font-extrabold ${ratingInfo.className}`}>{ratingInfo.title}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">{t('profile.rank')}</div>
            </div>
            <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center hover:bg-white/20 transition-all shadow-xl">
              <div className="text-lg font-extrabold text-neon-400">{user?.streak || 0}d</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">{t('profile.streak')}</div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-14 md:-mt-16">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-electric-400 via-violet-500 to-violet-600 p-[3px] shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <img src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} className="w-full h-full rounded-2xl bg-[var(--bg-card)] object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-lg">🇹🇭</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-500 border-2 border-[var(--bg-card)] flex items-center justify-center group-hover:scale-110 transition-transform" title="Online">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 mb-0 md:mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className={`text-2xl md:text-4xl tracking-tight ${ratingInfo.className}`}>{user?.name || "Anonymous"}</h1>
                <span className={`px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm text-xs ${ratingInfo.className}`}>{ratingInfo.title}</span>
                {user && <AdminRatingEditor userId={user.id} currentRating={user.rating || 1200} isAdmin={(user as any).role === "ADMIN"} />}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 hover:text-electric-400 transition-colors cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  @{user?.email?.split('@')[0] || "user"}
                </span>
                <span className="text-[var(--text-tertiary)]">•</span>
                <span>{t('profile.joined')}</span>
                <span className="text-[var(--text-tertiary)]">•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('profile.location')}
                </span>
              </p>
            </div>
            <div className="flex gap-3 mb-2 flex-wrap">
              <Link href="/profile/edit" className="btn-primary px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t('profile.edit')}
              </Link>
              <Link href="/submissions" className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-electric-500/40 transition-all hover:bg-[var(--bg-secondary)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Submissions
              </Link>
              <button 
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-[var(--border-color)] hover:border-electric-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)]"
                title={t('profile.share_title')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="profile-stat-card rounded-2xl p-5 text-center cursor-default">
          <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">{user?.rating || 1200}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 uppercase tracking-wider font-bold">{t('profile.rating')}</div>
          <div className="text-xs text-neon-400 mt-1 font-bold">{t('profile.this_week')}</div>
        </div>
        <div className="profile-stat-card rounded-2xl p-5 text-center cursor-default">
          <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">{user?.solvedCount || 0}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 uppercase tracking-wider font-bold">{t('profile.solved')}</div>
          <div className="text-xs text-electric-400 mt-1 font-bold">{t('profile.this_month')}</div>
        </div>
        <div className="profile-stat-card rounded-2xl p-5 text-center cursor-default">
          <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">0</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 uppercase tracking-wider font-bold">{t('profile.challenges')}</div>
          <div className="text-xs text-gold-400 mt-1 font-bold">{t('profile.just_started')}</div>
        </div>
        <div className="profile-stat-card rounded-2xl p-5 text-center cursor-default">
          <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">{user?.globalRank ? `#${user.globalRank}` : '-'}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 uppercase tracking-wider font-bold">{t('profile.global')}</div>
          <div className="text-xs text-rose-400 mt-1 font-bold">{t('profile.unranked')}</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card rounded-3xl p-6 bg-gradient-to-br from-[var(--bg-card)] to-transparent backdrop-blur-xl shadow-xl shadow-black/5 border border-[var(--border-color)]">
        <h3 className="font-bold text-[var(--text-primary)] mb-4 text-base flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {t('profile.achievements')}
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`achievement-badge flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${a.locked ? `opacity-40 hover:opacity-100` : ''} from-${a.color}-400/20 to-${a.color}-500/10 border border-${a.color}-500/20 flex items-center justify-center cursor-pointer`}
              title={a.title}
            >
              {a.icon === 'lock' ? (
                <svg className={`w-8 h-8 text-${a.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : a.icon === 'fire' ? (
                <svg className={`w-8 h-8 text-${a.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              ) : a.icon === 'check' ? (
                <svg className={`w-8 h-8 text-${a.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : a.icon === 'beaker' ? (
                <svg className={`w-8 h-8 text-${a.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              ) : (
                <svg className={`w-8 h-8 text-${a.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="card rounded-3xl p-6 bg-gradient-to-br from-[var(--bg-card)] to-transparent backdrop-blur-xl shadow-xl shadow-black/5 border border-[var(--border-color)]">
        <h3 className="font-bold text-[var(--text-primary)] mb-5 text-base">{t('profile.top_skills')}</h3>
        <div className="space-y-4">
          {skills.map((skill) => {
            const colors = colorMap[skill.color]
            return (
              <div key={skill.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold text-[var(--text-primary)] group-hover:text-${skill.color}-400 transition-colors`}>{skill.name}</span>
                  <span className="text-xs font-bold text-[var(--text-tertiary)]">{skill.level}</span>
                </div>
                <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${colors.from} ${colors.to} rounded-full`} style={{ width: `${skill.progress}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Submissions shortcut */}
      <div className="card rounded-3xl p-6 bg-gradient-to-br from-[var(--bg-card)] to-transparent backdrop-blur-xl shadow-xl shadow-black/5 border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-electric-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Submissions
          </h3>
          <Link href="/submissions" className="text-xs font-semibold text-electric-400 hover:text-electric-300 transition-colors">
            View all →
          </Link>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Track all your submitted answers, see grading status, and review AI feedback.
        </p>
        <Link href="/submissions" className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-electric-500/10 border border-electric-500/20 text-electric-400 hover:bg-electric-500/20 transition-colors text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Open My Submissions
        </Link>
      </div>
    </section>
  )
}
