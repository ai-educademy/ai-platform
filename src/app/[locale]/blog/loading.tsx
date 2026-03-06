export default function BlogLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 animate-pulse">
      <div className="text-center mb-16">
        <div className="h-10 bg-[var(--color-bg-card)] rounded-lg w-1/3 mx-auto mb-4" />
        <div className="h-5 bg-[var(--color-bg-card)] rounded w-1/2 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          />
        ))}
      </div>
    </div>
  );
}
