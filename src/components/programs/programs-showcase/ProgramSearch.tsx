"use client";

import { Search, X } from "lucide-react";

/* ─────────────────────── Search ─────────────────────── */
export function ProgramSearch({ query, onChange, placeholder }: { query: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="max-w-xl mx-auto mb-8 motion-section motion-fade-up motion-visible" style={{ transitionDelay: "400ms" }}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-primary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-sm outline-none transition-all duration-300 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)] placeholder:text-[var(--color-text-muted)]"
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-border)] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </button>
        )}
      </div>
    </div>
  );
}
