"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface NavDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  align?: "left" | "center" | "right";
  ariaLabel?: string;
}

export function NavDropdown({
  trigger,
  children,
  isActive = false,
  align = "center",
  ariaLabel = "Dropdown navigation",
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        // Return focus to trigger
        const btn = containerRef.current?.querySelector<HTMLElement>(
          '[role="button"], button, a'
        );
        btn?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const alignClass =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 ${
          isActive || open
            ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold"
            : "text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-text)]/[0.06]"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={handleOpen}
        onBlur={handleClose}
        onClick={() => setOpen((prev) => !prev)}
      >
        {trigger}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-primary)]" />
        )}
      </button>

      {/* Dropdown panel — CSS transition (always rendered, hidden via opacity/transform) */}
      <div
        className={`absolute top-full pt-2 ${alignClass} transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
        style={{ zIndex: 60 }}
      >
        <div
          className="rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden"
          style={{
            background: "var(--color-glass)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "var(--shadow-lg)",
          }}
          role="navigation"
          aria-label={ariaLabel}
          onFocus={handleOpen}
          onBlur={handleClose}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
