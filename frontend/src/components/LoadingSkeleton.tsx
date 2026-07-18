export function LoadingSkeleton({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`h-14 bg-surface-2 animate-pulse ${className}`}
        />
      ))}
    </div>
  )
}
