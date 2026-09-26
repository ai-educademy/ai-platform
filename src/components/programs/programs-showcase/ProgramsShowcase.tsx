"use client";

import { useState, useMemo, useEffect } from "react";
import type { Props } from "./types";
import { ProgramHeroSection } from "./ProgramHeroSection";
import { ProgramSearch } from "./ProgramSearch";
import { TrackTabs } from "./TrackTabs";
import { ProgramCard } from "./ProgramCard";

/* ─── main ─── */
export default function ProgramsShowcase({
  tracks,
  programsByTrack,
  basePath,
  t,
}: Props) {
  const [activeTrack, setActiveTrack] = useState<string | null>(null); // null = all tracks
  const [searchQuery, setSearchQuery] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-select track from URL hash (e.g. /programs#ai-learning)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setSearchQuery(query);
    const hash = window.location.hash.replace("#", "");
    if (hash && tracks.some((tr) => tr.slug === hash)) {
      setActiveTrack(hash);
    }
  }, [tracks]);

  const allPrograms = useMemo(
    () => Object.values(programsByTrack).flat(),
    [programsByTrack],
  );

  // Filter by track and search
  const filtered = useMemo(() => {
    let programs = activeTrack
      ? (programsByTrack[activeTrack] ?? [])
      : allPrograms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      programs = programs.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.topics.some((tp) => tp.toLowerCase().includes(q)) ||
          p.lessons.some((l) => l.title.toLowerCase().includes(q)),
      );
    }
    return programs;
  }, [activeTrack, searchQuery, programsByTrack, allPrograms]);

  const totalLessons = Math.max(
    150,
    allPrograms.reduce((s, p) => s + p.lessonCount, 0),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Hero ── */}
      <ProgramHeroSection
        t={t}
        stats={{
          tracks: tracks.length,
          programs: allPrograms.length,
          lessons: totalLessons,
        }}
      />

      {/* ── Search ── */}
      <ProgramSearch
        query={searchQuery}
        onChange={setSearchQuery}
        placeholder={t.searchPlaceholder}
        clearLabel={t.clearSearch}
      />

      {/* ── Track Tabs ── */}
      <TrackTabs
        tracks={tracks}
        active={activeTrack}
        onChange={setActiveTrack}
        allLabel={t.allTracks}
      />

      {/* ── Active Track Brand ── */}
      {activeTrack && (
        <div className="text-center mb-10 overflow-hidden motion-section motion-fade-in motion-visible">
          <p className="text-sm tracking-widest uppercase font-medium text-[var(--color-primary)] mb-1">
            {tracks.find((tr) => tr.slug === activeTrack)?.tagline}
          </p>
          {tracks.find((tr) => tr.slug === activeTrack)?.brand && (
            <p className="text-xs text-[var(--color-text-muted)] max-w-xl mx-auto mt-1 leading-relaxed">
              {tracks.find((tr) => tr.slug === activeTrack)?.brand}
            </p>
          )}
        </div>
      )}

      {/* ── Programs ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 motion-section motion-fade-in motion-visible">
          <div className="mx-auto max-w-2xl rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 shadow-md">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-[var(--color-text)]">
              {t.noResults}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t.emptySearchSuggestions}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTrack(null);
              }}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--color-primary)]/20 transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {t.clearSearch}
            </button>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {tracks.map((track) => (
                <button
                  key={track.slug}
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTrack(track.slug);
                  }}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  {track.icon} {track.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          key={`${activeTrack}-${searchQuery}`}
          className="grid grid-cols-[minmax(0,1fr)] gap-5 pb-24 md:grid-cols-2 xl:grid-cols-3"
        >
          {/* grid-cols-[minmax(0,1fr)] rather than a bare `grid`: grid items
              default to min-width:auto, so a single long compound word
              (German is full of them) sets a min-content floor wider than the
              column and pushes the whole page sideways on a 320px screen. */}
          {filtered.map((program, idx) => (
            <ProgramCard
              key={program.slug}
              program={program}
              basePath={basePath}
              t={t}
              index={idx}
              reducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
