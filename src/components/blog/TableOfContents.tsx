"use client";

import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/slugify";

interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

function parseHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/\*\*(.+?)\*\*/g, "$1").trim();
    headings.push({ level, text, id: slugify(text) });
  }

  return headings;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = parseHeadings(content);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the topmost visible heading
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    const observer = observerRef.current;
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (headings.length < 2) return null;

  const tocItems = (
    <ul className="space-y-0.5">
      {headings.map(({ id, text, level }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              setActiveId(id);
              setMobileOpen(false);
            }}
            style={{
              paddingLeft: level === 3 ? "1rem" : "0.25rem",
              color:
                activeId === id
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
              fontWeight: activeId === id ? 600 : 400,
              borderLeft: activeId === id
                ? "2px solid var(--color-primary)"
                : "2px solid transparent",
              transition: "color 0.2s, border-color 0.2s, font-weight 0.2s",
            }}
            className="block py-1 pr-2 text-xs leading-snug hover:text-[var(--color-text)] rounded-sm transition-colors"
          >
            {text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible "Contents" at top */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm font-semibold text-[var(--color-text)]"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <span aria-hidden="true">📋</span> Contents
          </span>
          <span
            aria-hidden="true"
            className="text-[var(--color-text-muted)] transition-transform duration-200"
            style={{ transform: mobileOpen ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </button>
        {mobileOpen && (
          <div className="mt-2 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            {tocItems}
          </div>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside
        className="hidden lg:block"
        aria-label="Table of contents"
      >
        <div
          className="sticky top-24 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-3">
            Contents
          </p>
          {tocItems}
        </div>
      </aside>
    </>
  );
}
