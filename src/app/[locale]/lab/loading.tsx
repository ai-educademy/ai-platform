export default function LabLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 animate-pulse">
      <div className="h-10 bg-[var(--color-bg-card)] rounded-lg w-1/3 mb-4" />
      <div className="h-5 bg-[var(--color-bg-card)] rounded w-1/2 mb-12" />
      {/* Tab skeleton */}
      <div className="flex gap-3 mb-8 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 w-32 shrink-0 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="h-96 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]" />
    </div>
  );
}
