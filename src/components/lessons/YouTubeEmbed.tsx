"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";

interface YouTubeEmbedProps {
  id: string;
  title?: string;
  short?: boolean;
  start?: number;
}

/**
 * Lazy-loaded YouTube embed with privacy-enhanced mode.
 * Shows a thumbnail + play button - only loads iframe on click.
 *
 * Usage in MDX:
 *   <YouTube id="dQw4w9WgXcQ" title="What is AI?" />
 *   <YouTube id="dQw4w9WgXcQ" short />        ← vertical Shorts aspect ratio
 *   <YouTube id="dQw4w9WgXcQ" start={30} />   ← start at 30 seconds
 */
export function YouTubeEmbed({ id, title, short = false, start }: YouTubeEmbedProps) {
  const t = useTranslations("lessons");
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;
  const [loaded, setLoaded] = useState(false);

  const handlePlay = useCallback(() => setLoaded(true), []);

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    ...(start ? { start: String(start) } : {}),
  });

  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  const thumbUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  return (
    <motion.figure
      className="my-8"
      initial={noMotion ? undefined : { opacity: 0, scale: 0.95 }}
      whileInView={noMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black shadow-sm ${
          short ? "aspect-[9/16] max-w-xs mx-auto" : "aspect-video"
        }`}
      >
        {loaded ? (
          <iframe
            src={embedUrl}
            title={title || t("videoFallback")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={handlePlay}
            className="absolute inset-0 w-full h-full group cursor-pointer min-h-[44px]"
            aria-label={`Play ${title || "video"}`}
          >
            {/* Thumbnail */}
            <img
              src={thumbUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-110 group-hover:bg-red-500 group-active:bg-red-500">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Duration badge */}
            {short && (
              <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                {t("shortBadge")}
              </div>
            )}
          </button>
        )}
      </div>
      {title && (
        <figcaption className="text-center text-sm text-[var(--color-text-muted)] mt-3">
          🎬 {title}
        </figcaption>
      )}
    </motion.figure>
  );
}
