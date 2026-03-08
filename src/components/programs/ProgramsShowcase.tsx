"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Search, X, BookOpen, Clock, BarChart3, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

/* ─── types ─── */
export interface TrackData {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  tagline: string;
  brand?: string;
}

export interface LessonData {
  slug: string;
  title: string;
  icon: string;
  duration: number;
}

export interface ProgramData {
  slug: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  level: number;
  status: string;
  estimatedHours: number;
  topics: string[];
  lessonCount: number;
  firstLessonSlug?: string;
  lessons: LessonData[];
}

export interface ProgramsI18n {
  title: string;
  subtitle: string;
  startLearning: string;
  comingSoon: string;
  hours: string;
  level: string;
  viewAll: string;
  levelLabels: Record<string, string>;
  statsTracksLabel: string;
  statsProgramsLabel: string;
  statsLessonsLabel: string;
  lessonsCount: string;
  moreLessons: string;
  showLess: string;
  searchPlaceholder: string;
  noResults: string;
  allTracks: string;
}

interface Props {
  tracks: TrackData[];
  programsByTrack: Record<string, ProgramData[]>;
  basePath: string;
  t: ProgramsI18n;
}

/* ─── animation variants ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── main ─── */
export default function ProgramsShowcase({ tracks, programsByTrack, basePath, t }: Props) {
  const [activeTrack, setActiveTrack] = useState<string | null>(null); // null = all tracks
  const [searchQuery, setSearchQuery] = useState("");
  const prefersReducedMotion = useReducedMotion();

  const allPrograms = useMemo(
    () => Object.values(programsByTrack).flat(),
    [programsByTrack]
  );

  // Filter by track and search
  const filtered = useMemo(() => {
    let programs = activeTrack ? (programsByTrack[activeTrack] ?? []) : allPrograms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      programs = programs.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.topics.some((tp) => tp.toLowerCase().includes(q)) ||
          p.lessons.some((l) => l.title.toLowerCase().includes(q))
      );
    }
    return programs;
  }, [activeTrack, searchQuery, programsByTrack, allPrograms]);

  const totalLessons = allPrograms.reduce((s, p) => s + p.lessonCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Hero ── */}
      <HeroSection t={t} stats={{ tracks: tracks.length, programs: allPrograms.length, lessons: totalLessons }} />

      {/* ── Search ── */}
      <SearchBar query={searchQuery} onChange={setSearchQuery} placeholder={t.searchPlaceholder} />

      {/* ── Track Tabs ── */}
      <TrackTabs tracks={tracks} active={activeTrack} onChange={setActiveTrack} allLabel={t.allTracks} />

      {/* ── Active Track Brand ── */}
      <AnimatePresence mode="wait">
        {activeTrack && (
          <motion.div
            key={activeTrack}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-10 overflow-hidden"
          >
            <p className="text-sm tracking-widest uppercase font-medium text-[var(--color-primary)] mb-1">
              {tracks.find((tr) => tr.slug === activeTrack)?.tagline}
            </p>
            {tracks.find((tr) => tr.slug === activeTrack)?.brand && (
              <p className="text-xs text-[var(--color-text-muted)] max-w-xl mx-auto mt-1 leading-relaxed">
                {tracks.find((tr) => tr.slug === activeTrack)?.brand}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Programs ── */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg text-[var(--color-text-muted)]">{t.noResults}</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTrack}-${searchQuery}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="grid gap-6 md:gap-8 pb-24"
          >
            {filtered.map((program, idx) => (
              <motion.div key={program.slug} variants={prefersReducedMotion ? undefined : fadeUp}>
                <ProgramCard program={program} basePath={basePath} t={t} index={idx} reducedMotion={!!prefersReducedMotion} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/* ─────────────────────── Hero ─────────────────────── */
function HeroSection({ t, stats }: { t: ProgramsI18n; stats: { tracks: number; programs: number; lessons: number } }) {
  return (
    <div className="relative py-20 sm:py-28 text-center overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-secondary)] opacity-[0.04] blur-[100px] animate-[float-slow_12s_ease-in-out_infinite]" />
      </div>

      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 text-gradient relative leading-tight tracking-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {t.title}
      </motion.h1>
      <motion.p
        className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-12 relative leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        {t.subtitle}
      </motion.p>

      {/* Stats */}
      <motion.div
        className="flex items-center justify-center gap-10 md:gap-20 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {([
          { value: stats.tracks, label: t.statsTracksLabel },
          { value: stats.programs, label: t.statsProgramsLabel },
          { value: stats.lessons, label: t.statsLessonsLabel },
        ]).map((s) => (
          <div key={s.label} className="text-center group">
            <motion.div
              className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {s.value}
            </motion.div>
            <div className="text-[11px] sm:text-xs text-[var(--color-text-muted)] uppercase tracking-widest mt-1.5 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────── Search ─────────────────────── */
function SearchBar({ query, onChange, placeholder }: { query: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <motion.div
      className="max-w-xl mx-auto mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] transition-colors group-focus-within:text-[var(--color-primary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-sm outline-none transition-all duration-300 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-glow)] placeholder:text-[var(--color-text-muted)]"
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-border)] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────── Track Tabs ─────────────────────── */
function TrackTabs({ tracks, active, onChange, allLabel }: {
  tracks: TrackData[];
  active: string | null;
  onChange: (s: string | null) => void;
  allLabel: string;
}) {
  return (
    <motion.div
      className="flex justify-center mb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
    >
      <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm max-w-full overflow-x-auto whitespace-nowrap">
        {/* All tracks tab */}
        <TabButton
          isActive={active === null}
          onClick={() => onChange(null)}
          icon="✦"
          label={allLabel}
        />
        {tracks.map((track) => (
          <TabButton
            key={track.slug}
            isActive={active === track.slug}
            onClick={() => onChange(track.slug)}
            icon={track.icon}
            label={track.title}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TabButton({ isActive, onClick, icon, label }: {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
        isActive ? "text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-track-pill"
          className="absolute inset-0 rounded-full bg-[var(--color-primary)] shadow-lg"
          style={{ boxShadow: "0 4px 12px var(--color-primary-glow, rgba(99,102,241,0.25))" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10 text-base">{icon}</span>
      <span className="relative z-10 hidden sm:inline">{label}</span>
    </button>
  );
}

/* ─────────────────────── Program Card ─────────────────────── */
function ProgramCard({ program, basePath, t, index, reducedMotion }: {
  program: ProgramData;
  basePath: string;
  t: ProgramsI18n;
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isActive = program.status === "active";
  const [lessonsExpanded, setLessonsExpanded] = useState(false);

  const href = program.firstLessonSlug
    ? `${basePath}/programs/${program.slug}/lessons/${program.firstLessonSlug}`
    : `${basePath}/programs/${program.slug}`;

  const visibleLessons = lessonsExpanded ? program.lessons : program.lessons.slice(0, 6);
  const hasMore = program.lessons.length > 6;

  return (
    <div ref={ref}>
      <motion.div
        className="group relative"
        initial={reducedMotion ? undefined : { opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : reducedMotion ? undefined : { opacity: 0, y: 40 }}
        transition={reducedMotion ? undefined : { duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {/* Animated glow border */}
        <div
          className="absolute -inset-px rounded-[28px] opacity-0 group-hover:opacity-100 transition-all duration-700"
          style={{
            background: `conic-gradient(from ${index * 72}deg, ${program.color}40, transparent, ${program.color}25, transparent, ${program.color}40)`,
            filter: "blur(1px)",
          }}
        />

        <div className={`relative rounded-[26px] p-6 sm:p-8 transition-all duration-500 ${
          isActive
            ? "bg-[var(--color-bg-card)] border border-[var(--color-border)] group-hover:border-transparent group-hover:shadow-2xl"
            : "bg-[var(--color-bg-card)]/50 border border-dashed border-[var(--color-border)] opacity-50"
        }`}>
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
            style={{ background: `linear-gradient(90deg, transparent, ${program.color}, transparent)` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 0.6 } : {}}
            transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
          />

          <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
            {/* ── Left: Program Info ── */}
            <div className={`${isActive && program.lessons.length > 0 ? "lg:w-[42%] lg:min-w-[42%]" : "w-full"}`}>
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${program.color}22, ${program.color}08)`,
                    boxShadow: `0 4px 16px ${program.color}12`,
                  }}
                  whileHover={{ scale: 1.12, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {program.icon}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-xl font-bold leading-relaxed">{program.title}</h3>
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${program.color}15`, color: program.color }}
                    >
                      {t.level} {program.level}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{program.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5 line-clamp-3">
                {program.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Chip color={program.color}>
                  <BookOpen className="w-3 h-3" />
                  {t.lessonsCount.replace("{count}", String(program.lessonCount))}
                </Chip>
                <Chip>
                  <Clock className="w-3 h-3" />
                  ~{program.estimatedHours}{t.hours}
                </Chip>
                <Chip color={program.color} filled>
                  <BarChart3 className="w-3 h-3" />
                  {t.levelLabels[String(program.level)] ?? ""}
                </Chip>
              </div>

              {/* CTA */}
              {isActive ? (
                <Link href={href} className="inline-block group/cta">
                  <motion.span
                    className="inline-flex items-center gap-2.5 rounded-2xl px-7 py-3 text-sm font-bold text-white shadow-lg transition-shadow hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${program.color}, ${program.color}bb)`,
                      boxShadow: `0 8px 24px ${program.color}30`,
                    }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t.startLearning}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                  </motion.span>
                </Link>
              ) : (
                <motion.span
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🔒 {t.comingSoon}
                </motion.span>
              )}
            </div>

            {/* ── Right: Lesson Tiles ── */}
            {isActive && program.lessons.length > 0 && (
              <div className="lg:w-[58%]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <AnimatePresence>
                    {visibleLessons.map((lesson, i) => (
                      <motion.div
                        key={lesson.slug}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link href={`${basePath}/programs/${program.slug}/lessons/${lesson.slug}`}>
                          <motion.div
                            className="group/tile relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 min-h-[60px] cursor-pointer overflow-hidden"
                            whileHover={{ y: -3, scale: 1.02, borderColor: program.color + "60" }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Hover shimmer */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover/tile:opacity-100 transition-opacity duration-500 rounded-xl"
                              style={{ background: `linear-gradient(135deg, ${program.color}10, transparent 60%, ${program.color}05)` }}
                            />
                            <div className="relative flex items-center gap-2.5">
                              <span className="text-sm shrink-0">{lesson.icon || "📄"}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold line-clamp-2 leading-tight">{lesson.title}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{lesson.duration}m</p>
                              </div>
                            </div>
                            {/* Number watermark */}
                            <div
                              className="absolute top-0.5 right-1.5 text-[9px] font-black opacity-10 group-hover/tile:opacity-25 transition-opacity"
                              style={{ color: program.color }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {hasMore && (
                  <motion.button
                    onClick={() => setLessonsExpanded(!lessonsExpanded)}
                    className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
                    whileTap={{ scale: 0.97 }}
                  >
                    {lessonsExpanded ? (
                      <>{t.showLess} <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>{t.moreLessons.replace("{count}", String(program.lessons.length - 6))} <ChevronDown className="w-3 h-3" /></>
                    )}
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Chip ─── */
function Chip({ children, color, filled }: { children: React.ReactNode; color?: string; filled?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-colors"
      style={
        filled && color
          ? { borderColor: `${color}40`, color, backgroundColor: `${color}12` }
          : color
            ? { borderColor: `${color}25`, color: "var(--color-text-muted)" }
            : { borderColor: "var(--color-border)", color: "var(--color-text-muted)" }
      }
    >
      {children}
    </span>
  );
}
