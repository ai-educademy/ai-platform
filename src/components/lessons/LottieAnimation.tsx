"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Lottie from "lottie-react";
import { motion, useReducedMotion } from "framer-motion";

interface LottieAnimationProps {
  src: string;
  alt?: string;
  caption?: string;
  loop?: boolean;
  autoplay?: boolean;
  height?: number;
  speed?: number;
}

/**
 * Scroll-triggered Lottie animation with lazy loading.
 * Only loads the animation JSON when visible in viewport.
 *
 * Usage in MDX:
 *   <Animation src="/animations/neural-network.json" caption="How neurons connect" />
 *   <Animation src="/animations/data-flow.json" loop={false} />
 *   <Animation src="https://assets.lottiefiles.com/..." height={300} />
 */
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
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<{ play: () => void; pause: () => void; setSpeed: (s: number) => void } | null>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);

  // Intersection observer — load when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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

  const noMotion = !!prefersReduced;

  return (
    <motion.figure
      className="my-8"
      ref={containerRef}
      initial={noMotion ? undefined : { opacity: 0, scale: 0.95 }}
      whileInView={noMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
            lottieRef={lottieRef as React.MutableRefObject<never>}
            animationData={animationData}
            loop={noMotion ? false : loop}
            autoplay={noMotion ? false : autoplay}
            style={{ height: Math.min(height, typeof window !== "undefined" && window.innerWidth < 640 ? 200 : height), maxWidth: "100%" }}
            onDOMLoaded={() => {
              if (lottieRef.current && speed !== 1) {
                lottieRef.current.setSpeed(speed);
              }
            }}
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
    </motion.figure>
  );
}
