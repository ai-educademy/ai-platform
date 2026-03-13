export default function JourneyLoading() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero skeleton */}
        <div className="text-center mb-12 space-y-4">
          <div className="h-10 w-80 mx-auto rounded-lg bg-[var(--color-border)] animate-pulse" />
          <div className="h-5 w-96 mx-auto rounded-lg bg-[var(--color-border)] animate-pulse opacity-60" />
        </div>

        {/* Progress bar skeleton */}
        <div className="h-3 w-full max-w-md mx-auto rounded-full bg-[var(--color-border)] animate-pulse mb-16" />

        {/* Track skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-12">
            <div className="h-7 w-48 rounded-lg bg-[var(--color-border)] animate-pulse mb-6" />
            <div className="flex flex-col md:flex-row gap-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="h-28 flex-1 rounded-2xl bg-[var(--color-border)] animate-pulse opacity-60"
                  style={{ animationDelay: `${j * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
