"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function useInViewLocal(margin = "-60px") {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); } },
      { rootMargin: margin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);
  return { ref, isInView };
}

export default function AboutPage() {
  const t = useTranslations("about");
  const noMotion = useReducedMotion();

  const hero = useInViewLocal();
  const values = useInViewLocal();
  const story = useInViewLocal();
  const oss = useInViewLocal();
  const connect = useInViewLocal();

  const fadeUp = (inView: boolean, delay = 0, y = 24) => noMotion ? undefined : {
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : `translateY(${y}px)`,
    transition: `opacity 0.5s ${EASE} ${delay}ms, transform 0.5s ${EASE} ${delay}ms`,
  };

  const fadeIn = (inView: boolean, delay = 0) => noMotion ? undefined : {
    opacity: inView ? 1 : 0,
    transition: `opacity 0.5s ${EASE} ${delay}ms`,
  };

  const scaleIn = (inView: boolean, delay = 0) => noMotion ? undefined : {
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : "scale(0.8)",
    transition: `opacity 0.5s ${EASE} ${delay}ms, transform 0.5s ${EASE} ${delay}ms`,
  };

  const valuesList = [
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>), key: "value1" },
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>), key: "value2" },
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>), key: "value3" },
    { icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><path d="M7 15l5-5 5 5" /></svg>), key: "value4" },
  ];

  const GitHubIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div ref={hero.ref} className="text-center mb-24">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gradient mb-6 tracking-tight" style={fadeUp(hero.isInView, 0, 30)}>{t("title")}</h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed" style={fadeUp(hero.isInView, 150)}>{t("pageSubtitle")}</p>
      </div>

      <section className="mb-24 text-center max-w-3xl mx-auto">
        <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed text-[var(--color-text)] tracking-tight" style={fadeUp(hero.isInView, 300)}>&ldquo;{t("missionText")}&rdquo;</blockquote>
      </section>

      <section ref={values.ref} className="mb-24">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)] text-center mb-12" style={fadeIn(values.isInView)}>{t("values")}</h2>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
          {valuesList.map(({ icon, key }, i) => (
            <div key={key} className="group flex gap-4 p-4 -mx-4 rounded-2xl transition-all duration-300 hover:bg-[var(--color-bg-card)] hover:-translate-y-0.5 hover:shadow-sm" style={fadeUp(values.isInView, 100 + i * 100)}>
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">{icon}</div>
              <div>
                <h3 className="font-semibold mb-1">{t(`${key}.title`)}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{t(`${key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={story.ref} className="mb-24 max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)] text-center mb-10" style={fadeIn(story.isInView)}>{t("story")}</h2>
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="shrink-0 mx-auto sm:mx-0" style={scaleIn(story.isInView, 200)}>
            <Image src="https://avatars.githubusercontent.com/u/134313151?v=4" alt="Ramesh Reddy Adutla" width={120} height={120} className="rounded-2xl shadow-lg" unoptimized />
          </div>
          <div className="space-y-6 text-[var(--color-text-muted)] leading-relaxed">
            {(["storyText1", "storyText2", "storyText3", "storyText4"] as const).map((key, i) => (
              <p key={key} style={fadeUp(story.isInView, 300 + i * 100, 16)}>{t(key)}</p>
            ))}
          </div>
        </div>
      </section>

      <section ref={oss.ref} className="mb-24 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-6 transition-transform hover:scale-110 hover:rotate-[5deg]" style={scaleIn(oss.isInView)}><GitHubIcon /></div>
        <h2 className="text-2xl font-bold mb-3" style={fadeUp(oss.isInView, 100, 16)}>{t("openSourceTitle")}</h2>
        <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed" style={fadeUp(oss.isInView, 200, 12)}>{t("openSourceDesc")}</p>
        <a href="https://github.com/ai-educademy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-card)] hover:scale-[1.04] hover:-translate-y-px active:scale-[0.98] transition-all duration-200">
          <GitHubIcon size={18} />{t("viewOnGithub")}
        </a>
      </section>

      <section ref={connect.ref} className="text-center">
        <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-muted)]" style={fadeIn(connect.isInView)}>{t("connect")}</h2>
        <div className="flex items-center justify-center gap-5">
          {[
            { href: "https://github.com/rameshreddy-adutla", label: "GitHub", hoverColor: "hover:text-[var(--color-text)] dark:hover:text-white", icon: <GitHubIcon size={26} /> },
            { href: "https://linkedin.com/in/rameshreddy-adutla", label: "LinkedIn", hoverColor: "hover:text-[#0077B5]", icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>) },
            { href: "https://dev.to/rameshreddy-adutla", label: "Dev.to", hoverColor: "hover:text-[var(--color-text)] dark:hover:text-white", icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.2-.16.29-.45.29-.84v-2.22c0-.39-.1-.68-.29-.84zM0 0v24h24V0H0zm8.1 15.01c-.28.4-.74.6-1.38.6H4.5V8.4h2.22c.64 0 1.1.2 1.38.6.28.4.42.98.42 1.76v2.5c0 .77-.14 1.35-.42 1.75zm4.38-5.46c0 .4-.1.7-.29.89-.2.2-.5.3-.89.3h-.77v2.67h-1.5V8.4h2.27c.4 0 .7.1.89.3.2.19.29.49.29.89v.96zm6.02 5.46h-1.5l-.9-4.38h-.06l.06 1.6v2.78h-1.36V8.4h1.5l.92 4.64h.05l-.05-1.66V8.4h1.34v7.01z" /></svg>) },
          ].map((social, i) => (
            <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={`text-[var(--color-text-muted)] ${social.hoverColor} transition-all duration-200 hover:scale-115 active:scale-95`} style={fadeUp(connect.isInView, 100 + i * 80, 12)}>
              {social.icon}
            </a>
          ))}
        </div>
        <a
          href="https://buymeacoffee.com/rameshreddyadutla"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[#FFDD00] text-[#000] text-sm font-semibold hover:scale-[1.04] hover:-translate-y-px active:scale-[0.98] transition-all duration-200 shadow-sm"
          style={fadeUp(connect.isInView, 350, 12)}
        >
          ☕ {t("buyCoffee")}
        </a>
      </section>
    </div>
  );
}
