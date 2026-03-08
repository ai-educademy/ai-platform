"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { ComingSoonCard } from "@/components/ui/ComingSoon";

/* ── Types ── */
interface ProgramInfo {
  slug: string;
  icon: string;
  title: string;
  color: string;
  active: boolean;
  level: number;
}

interface TrackCardProps {
  trackIcon: string;
  trackTitle: string;
  trackDesc: string;
  programs: ProgramInfo[];
  programTitles: Record<string, string>;
  firstLessonSlugs: Record<string, string | undefined>;
  lessonNames: Record<string, string[]>;
  basePath: string;
  href: string;
  delay?: number;
}

interface HomeProgramCardsProps {
  sectionTitle: string;
  sectionSubtitle: string;
  trackAI: TrackCardProps;
  trackCraft: TrackCardProps;
  viewAllText: string;
  viewAllHref: string;
  featuresTitle: string;
  features: Array<{ icon: string; title: string; desc: string }>;
}

/* ── Animation helpers ── */
const ease = [0.25, 0.4, 0.25, 1] as const;
const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

/* ── Feature Card ── */
function FeatureCard({ icon, title, desc, index, reduced }: {
  icon: string; title: string; desc: string; index: number; reduced: boolean;
}) {
  return (
    <motion.div
      className="group relative p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] gradient-border-hover transition-all duration-300"
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={reduced ? {} : { y: -4, transition: { ...spring } }}
      style={{ willChange: "transform" }}
    >
      <motion.span
        className="text-2xl mb-3 block"
        whileHover={reduced ? {} : { scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 12 } }}
      >
        {icon}
      </motion.span>
      <h3 className="text-sm font-bold mb-1 group-hover:text-[var(--color-primary)] transition-colors duration-200">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── Track Card ── */
function TrackCard({ data, delay = 0, reduced }: {
  data: TrackCardProps; delay?: number; reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const trackColorClass = data.trackIcon === "🌳"
    ? "hover:border-emerald-500/60"
    : "hover:border-amber-500/60";

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.001, ease }}
    >
      <ClickableCard href={data.href} className="block h-full">
        <motion.div
          className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 h-full ${trackColorClass} transition-all duration-300`}
          whileHover={reduced ? {} : { y: -4, boxShadow: "var(--shadow-lg)" }}
          transition={spring}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{data.trackIcon}</span>
            <div>
              <h3 className="text-xl font-bold">{data.trackTitle}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {data.programs.length} programs
              </p>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
            {data.trackDesc}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {data.programs.map((program) => {
              const title = (data.programTitles[program.slug] || "").replace("AI ", "");
              const href = data.firstLessonSlugs[program.slug]
                ? `${data.basePath}/programs/${program.slug}/lessons/${data.firstLessonSlugs[program.slug]}`
                : `${data.basePath}/programs/${program.slug}`;

              return program.active ? (
                <motion.div
                  key={program.slug}
                  whileHover={reduced ? {} : { scale: 1.1, transition: spring }}
                >
                  <Link
                    href={href}
                    className="group/prog text-center p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all duration-200 block"
                    style={{ borderLeftColor: program.color, borderLeftWidth: 3 }}
                  >
                    <div className="text-2xl mb-1">{program.icon}</div>
                    <div className="text-[10px] font-bold truncate group-hover/prog:text-[var(--color-primary)] transition-colors">
                      {title}
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <ComingSoonCard
                  key={program.slug}
                  icon={program.icon}
                  label={title}
                />
              );
            })}
          </div>
        </motion.div>
      </ClickableCard>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function HomeProgramCards({
  sectionTitle,
  sectionSubtitle,
  trackAI,
  trackCraft,
  viewAllText,
  viewAllHref,
  featuresTitle,
  features,
}: HomeProgramCardsProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();
  const reduced = !!prefersReduced;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section A: Why AI Educademy? */}
      <motion.div
        className="text-center mb-8"
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">{featuresTitle}</h2>
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-24"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {features.map((f, i) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} index={i} reduced={reduced} />
        ))}
      </motion.div>

      {/* Section B: Program tracks */}
      <motion.div
        ref={headerRef}
        className="text-center mb-12"
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">{sectionTitle}</h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {sectionSubtitle}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <TrackCard data={trackAI} reduced={reduced} />
        <TrackCard data={trackCraft} delay={150} reduced={reduced} />
      </div>

      {/* View all link with animated arrow */}
      <motion.div
        className="text-center"
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: 0.1, ease }}
      >
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-1 text-[var(--color-primary)] font-semibold hover:underline"
        >
          {viewAllText}
          <motion.span
            className="inline-block"
            whileHover={reduced ? {} : { x: 4 }}
            transition={spring}
          >
            →
          </motion.span>
        </Link>
      </motion.div>
    </div>
  );
}
