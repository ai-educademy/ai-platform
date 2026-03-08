"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const start = performance.now();
    const from = Math.max(0, value - 50);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

export function PageViewCounter() {
  const t = useTranslations("footer");
  const [views, setViews] = useState<number | null>(null);
  const hasFetched = useRef(false);

  const fetchViews = useCallback(async () => {
    try {
      const res = await fetch("/api/page-views");
      const data = await res.json();
      if (data.views != null) {
        setViews(data.views);
      }
    } catch {
      // Silently fail - counter is optional
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchViews();
  }, [fetchViews]);

  if (views === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span>
        <AnimatedNumber value={views} /> {t("pageViews")}
      </span>
    </div>
  );
}
