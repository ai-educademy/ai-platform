"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function ClickableCard({ href, children, className, ariaLabel }: { href: string; children: ReactNode; className?: string; ariaLabel: string }) {
  const router = useRouter();

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={ariaLabel}
      className={className}
      onClick={(e) => {
        // Don't navigate if user clicked a real link inside
        if ((e.target as HTMLElement).closest("a")) return;
        router.push(href);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !(e.target as HTMLElement).closest("a")) {
          router.push(href);
        }
      }}
    >
      {children}
    </div>
  );
}
