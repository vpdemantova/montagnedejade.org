export function PageSkeleton() {
  return (
    <div className="relative min-h-screen animate-pulse">
      {/* Header */}
      <div className="border-b border-solar-border/20 pt-12 pb-6 px-4 md:px-12 max-w-6xl mx-auto">
        <div className="h-2 w-24 bg-solar-border/20 rounded mb-4" />
        <div className="h-10 w-64 bg-solar-border/25 rounded" />
      </div>

      {/* Content rows */}
      <div className="max-w-6xl mx-auto px-4 md:px-12 py-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-solar-border/10 rounded" style={{ opacity: 1 - i * 0.12 }} />
        ))}
      </div>
    </div>
  )
}
