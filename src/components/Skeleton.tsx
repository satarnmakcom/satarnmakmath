export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--border-color)] to-[var(--bg-secondary)] rounded-xl bg-[length:400%_100%] ${className}`}
      style={{
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  )
}
