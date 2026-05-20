import Link from "next/link"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  actionOnClick 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center border border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)]">
      <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-6 text-electric-500">
        {icon || (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      
      {actionLabel && (
        actionHref ? (
          <Link 
            href={actionHref}
            className="px-6 py-2.5 bg-[var(--bg-primary)] border border-electric-500/50 text-electric-500 font-semibold rounded-xl hover:bg-electric-500/10 transition-colors"
          >
            {actionLabel}
          </Link>
        ) : (
          <button 
            onClick={actionOnClick}
            className="px-6 py-2.5 bg-[var(--bg-primary)] border border-electric-500/50 text-electric-500 font-semibold rounded-xl hover:bg-electric-500/10 transition-colors"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}
