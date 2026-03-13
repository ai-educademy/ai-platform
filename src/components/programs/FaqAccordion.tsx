"use client";

import { useState, useCallback } from "react";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({
  items,
  programColor,
}: {
  items: FaqItem[];
  programColor: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="space-y-3" role="list">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const headingId = `faq-heading-${idx}`;
        const panelId = `faq-panel-${idx}`;

        return (
          <div
            key={idx}
            role="listitem"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden transition-all duration-300"
            style={isOpen ? { borderColor: `${programColor}40` } : undefined}
          >
            <button
              id={headingId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(idx);
                }
              }}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium text-sm transition-colors duration-200 hover:bg-[var(--color-primary)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-xl"
            >
              <span>{item.q}</span>
              <span
                className="shrink-0 text-[var(--color-text-muted)] transition-transform duration-300"
                style={isOpen ? { transform: "rotate(180deg)" } : undefined}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: isOpen ? "500px" : "0",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="px-5 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
