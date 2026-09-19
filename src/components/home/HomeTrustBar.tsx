interface HomeTrustBarProps {
  items: { icon: string; value: string; label: string }[];
}

export default function HomeTrustBar({ items }: HomeTrustBarProps) {
  return (
    <div className="w-full py-4 sm:py-5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className="flex flex-wrap items-center justify-center gap-x-0 gap-y-2 rounded-2xl border backdrop-blur-md px-4 py-3 sm:py-4"
          style={{
            background: "var(--color-glass)",
            borderColor: "var(--color-glass-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div
                  className="h-8 w-px mx-2 sm:mx-5 shrink-0"
                  style={{ background: "var(--color-border)" }}
                />
              )}
              {/* Wrapping matters here. This row is three nowrap items and it
                  already spilled past a 768px viewport in English; German and
                  Telugu labels are longer still, so a fixed single row was
                  guaranteed to push a horizontal scrollbar onto the homepage
                  in several locales. */}
              <div className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap">
                <span className="text-base sm:text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                  {item.value}
                </span>
                <span className="hidden sm:inline" style={{ color: "var(--color-text-muted)" }}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
