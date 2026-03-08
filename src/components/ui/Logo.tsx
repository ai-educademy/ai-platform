"use client";

/**
 * Logo mark: a seed sprouting with a neural-network node pattern.
 * The three dots represent connected AI nodes; the stem represents growth.
 */
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="20" cy="20" r="19" className="fill-[var(--color-primary)]" opacity="0.1" />
      <circle cx="20" cy="20" r="19" className="stroke-[var(--color-primary)]" strokeWidth="1.5" opacity="0.3" />

      {/* Seed body - rounded teardrop */}
      <path
        d="M20 32c-4.5 0-8-3.5-8-8 0-6 8-14 8-14s8 8 8 14c0 4.5-3.5 8-8 8z"
        className="fill-[var(--color-primary)]"
        opacity="0.9"
      />

      {/* Leaf vein / stem */}
      <path
        d="M20 18v10"
        className="stroke-white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M20 23c-2.5-1.5-4-3.5-4-3.5M20 25c2.5-1.5 4-3.5 4-3.5"
        className="stroke-white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Neural network nodes - three connected dots above the seed */}
      <circle cx="14" cy="11" r="2.5" className="fill-[var(--color-primary)]" />
      <circle cx="26" cy="11" r="2.5" className="fill-[var(--color-primary)]" />
      <circle cx="20" cy="6" r="2.5" className="fill-[var(--color-primary)]" />

      {/* Neural connections */}
      <line x1="14" y1="11" x2="20" y2="6" className="stroke-[var(--color-primary)]" strokeWidth="1.2" opacity="0.5" />
      <line x1="26" y1="11" x2="20" y2="6" className="stroke-[var(--color-primary)]" strokeWidth="1.2" opacity="0.5" />
      <line x1="14" y1="11" x2="26" y2="11" className="stroke-[var(--color-primary)]" strokeWidth="1.2" opacity="0.5" />

      {/* Connection from network to seed */}
      <line x1="20" y1="8.5" x2="20" y2="18" className="stroke-[var(--color-primary)]" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
    </svg>
  );
}
