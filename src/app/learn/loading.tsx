import { Skeleton } from "@/components/Skeleton"

export default function LearnLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Skeleton */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32 mx-auto rounded-full" />
        <Skeleton className="h-14 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-full mx-auto" />
        <Skeleton className="h-6 w-5/6 mx-auto" />
      </div>

      {/* Modules Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card rounded-3xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg flex flex-col h-full space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-16 w-full" />
            
            <div className="pt-4 mt-auto">
              <Skeleton className="h-2 w-full rounded-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
