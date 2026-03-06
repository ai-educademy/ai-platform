export default function ProgramsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 animate-pulse">
      <div className="h-10 bg-[var(--color-bg-card)] rounded-lg w-1/2 mb-4" />
      <div className="h-5 bg-[var(--color-bg-card)] rounded w-1/3 mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          />
        ))}
      </div>
    </div>
  );
}
