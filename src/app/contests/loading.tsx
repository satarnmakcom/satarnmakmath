import { Skeleton } from "@/components/Skeleton"

export default function ContestsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <Skeleton className="h-8 w-32 mb-4 rounded-full" />
          <Skeleton className="h-12 w-64 mb-3" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Skeleton className="h-12 w-full md:w-32 rounded-xl" />
        </div>
      </div>

      {/* Mock Exams Grid Skeleton */}
      <div className="relative z-10 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg flex flex-col h-full">
              <Skeleton className="h-6 w-24 mb-4 rounded-full" />
              <Skeleton className="h-8 w-48 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <div className="mt-auto space-y-4">
                <div className="flex justify-between border-t border-[var(--border-color)] pt-4">
                  <div>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-3 w-16 mb-2 ml-auto" />
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
