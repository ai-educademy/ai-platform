"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease },
  }),
};


/* ── Feature Card ── */
function FeatureCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  return (
    <motion.div
      className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <span className="text-2xl mb-3 block">{icon}</span>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── Track Card (simplified) ── */
function TrackCard({ data, delay = 0 }: { data: TrackCardProps; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.001, ease }}
    >
      <ClickableCard href={data.href} className="block h-full">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 h-full hover:shadow-lg hover:border-[var(--color-primary)] transition-all duration-200">
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
                <Link
                  key={program.slug}
                  href={href}
                  className="group text-center p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-section)] hover:border-[var(--color-primary)] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  style={{ borderLeftColor: program.color, borderLeftWidth: 3 }}
                >
                  <div className="text-2xl mb-1">{program.icon}</div>
                  <div className="text-[10px] font-bold truncate group-hover:text-[var(--color-primary)] transition-colors">
                    {title}
                  </div>
                </Link>
              ) : (
                <ComingSoonCard
                  key={program.slug}
                  icon={program.icon}
                  label={title}
                />
              );
            })}
          </div>
        </div>
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section A: Why AI Educademy? */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">{featuresTitle}</h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          Everything you need to go from curious beginner to confident builder.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
        {features.map((f, i) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} index={i} />
        ))}
      </div>

      {/* Section B: Program tracks */}
      <motion.div
        ref={headerRef}
        className="text-center mb-10"
        initial={{ opacity: 0, y: 24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">{sectionTitle}</h2>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {sectionSubtitle}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <TrackCard data={trackAI} />
        <TrackCard data={trackCraft} delay={100} />
      </div>

      {/* View all link */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: 0.1, ease }}
      >
        <Link
          href={viewAllHref}
          className="text-[var(--color-primary)] font-semibold hover:underline"
        >
          {viewAllText} →
        </Link>
      </motion.div>
    </div>
  );
}
