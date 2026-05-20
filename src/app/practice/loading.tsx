import { Skeleton } from "@/components/Skeleton"

export default function PracticeLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
          
          {/* Tags Filter */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-16" />
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Difficulty Range */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Problems List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Problem Cards */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="space-y-3 flex-1 w-full">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
