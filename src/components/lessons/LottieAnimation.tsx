"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Lottie } from "lottie-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface LottieAnimationProps {
  src: string;
  alt?: string;
  caption?: string;
  loop?: boolean;
  autoplay?: boolean;
  height?: number;
  speed?: number;
}

export function LottieAnimation({
  src,
  alt,
  caption,
  loop = true,
  autoplay = true,
  height = 280,
  speed = 1,
}: LottieAnimationProps) {
  const t = useTranslations("lessons");
  const noMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);

  // Intersection observer - load when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fetch animation data when visible
  useEffect(() => {
    if (!isVisible) return;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load animation: ${res.status}`);
        return res.json();
      })
      .then(setAnimationData)
      .catch(() => setError(true));
  }, [isVisible, src]);

  return (
    <figure
      className="my-8"
      ref={containerRef}
      style={noMotion ? undefined : {
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "scale(0.95)",
        transition: "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)] flex items-center justify-center"
        style={{ minHeight: Math.min(height, 240) }}
        role="img"
        aria-label={alt || caption || "Animation"}
      >
        {error ? (
          <div className="text-[var(--color-text-muted)] text-sm flex flex-col items-center gap-2 p-8">
            <span className="text-3xl">🎭</span>
            <span>{t("animationError")}</span>
          </div>
        ) : animationData ? (
          <Lottie
            src={animationData}
            loop={noMotion ? false : loop}
            autoplay={noMotion ? false : autoplay}
            speed={noMotion ? 1 : speed}
            style={{ height: Math.min(height, typeof window !== "undefined" && window.innerWidth < 640 ? 200 : height), maxWidth: "100%" }}
          />
        ) : (
          <div className="flex items-center justify-center" style={{ height: Math.min(height, 200) }}>
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {(caption || alt) && (
        <figcaption className="text-center text-sm text-[var(--color-text-muted)] mt-3 italic">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}
