import { Skeleton } from "@/components/Skeleton"

export default function LeaderboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <Skeleton className="h-8 w-24 mb-4 rounded-full" />
          <Skeleton className="h-12 w-64 mb-3" />
          <Skeleton className="h-5 w-80" />
        </div>
        
        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl relative z-10 bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-4"><Skeleton className="h-4 w-12" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-16" /></th>
                <th className="px-6 py-4"><Skeleton className="h-4 w-12" /></th>
                <th className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></th>
                <th className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-color)]">
                  <td className="px-6 py-5"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </td>
                  <td className="px-6 py-5"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-6 py-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="px-6 py-5 text-right"><Skeleton className="h-5 w-10 ml-auto" /></td>
                  <td className="px-6 py-5 text-right flex justify-end gap-1">
                    <Skeleton className="h-4 w-3" />
                    <Skeleton className="h-4 w-3" />
                    <Skeleton className="h-4 w-3" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
