import { Skeleton } from "@/components/Skeleton"

export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Profile Header Skeleton */}
      <div className="relative">
        <Skeleton className="h-48 md:h-64 w-full rounded-3xl" />
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-[var(--bg-primary)]" />
          <div className="mb-4 space-y-3">
            <Skeleton className="h-10 w-48" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-16 right-8 mb-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="card rounded-3xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)]">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card rounded-3xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] text-center">
                <Skeleton className="h-10 w-10 mx-auto rounded-xl mb-3" />
                <Skeleton className="h-8 w-20 mx-auto mb-1" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>

          {/* Activity Graph Skeleton */}
          <div className="card rounded-3xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)]">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="h-40 w-full rounded-xl bg-gradient-to-t from-[var(--border-color)]/50 to-transparent flex items-end justify-between px-2 pb-2">
               {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className={`w-8 rounded-t-sm`} style={{ height: `${Math.random() * 80 + 20}%` }} />
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
