"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { AnimatedSection } from "@/components/ui/MotionWrappers";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { locales } from "@/i18n/locales";

const BASE_URL = "https://aieducademy.org";

const SUBJECT_KEYS = [
  "subjectGeneral",
  "subjectBug",
  "subjectFeature",
  "subjectPartnership",
  "subjectOther",
] as const;

const SUBJECT_VALUES = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Partnership",
  "Other",
] as const;

type FormStatus = "idle" | "sending" | "success" | "error" | "rateLimit";

export default function ContactPage() {
  const t = useTranslations("contact");
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = (locales as readonly string[]).includes(segments[0])
    ? segments[0]
    : "en";
  const basePath = locale === "en" ? "" : `/${locale}`;
  const pageUrl = `${BASE_URL}${basePath}/contact`;

  const [status, setStatus] = useState<FormStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECT_VALUES[0]);
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("required");
    if (!email.trim()) errs.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("invalidEmail");
    if (!message.trim()) errs.message = t("required");
    else if (message.trim().length < 10) errs.message = t("messageTooShort");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject, message: message.trim() }),
      });

      if (res.status === 429) {
        setStatus("rateLimit");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject(SUBJECT_VALUES[0]);
        setMessage("");
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[48px]";

  const GitHubIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );

  const LinkedInIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );

  const DevToIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.2-.16.29-.45.29-.84v-2.22c0-.39-.1-.68-.29-.84zM0 0v24h24V0H0zm8.1 15.01c-.28.4-.74.6-1.38.6H4.5V8.4h2.22c.64 0 1.1.2 1.38.6.28.4.42.98.42 1.76v2.5c0 .77-.14 1.35-.42 1.75zm4.38-5.46c0 .4-.1.7-.29.89-.2.2-.5.3-.89.3h-.77v2.67h-1.5V8.4h2.27c.4 0 .7.1.89.3.2.19.29.49.29.89v.96zm6.02 5.46h-1.5l-.9-4.38h-.06l.06 1.6v2.78h-1.36V8.4h1.5l.92 4.64h.05l-.05-1.66V8.4h1.34v7.01z" />
    </svg>
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}${basePath}/` },
          { name: t("title"), url: pageUrl },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Hero */}
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 mb-5">
              <span className="text-2xl" aria-hidden="true">✉️</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t("title")}</h1>
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </AnimatedSection>

        {/* Contact Form */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              background: "var(--color-glass)",
              borderColor: "var(--color-glass-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {status === "success" ? (
              <div className="text-center py-8" role="status" aria-live="polite">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <span className="text-3xl" aria-hidden="true">🎉</span>
                </div>
                <p className="text-lg font-semibold text-emerald-500 mb-2">{t("success")}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{t("responseTime")}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg-card)] transition-colors cursor-pointer"
                >
                  {t("submit")} ↩
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
                aria-describedby={
                  status === "error"
                    ? "contact-form-error"
                    : status === "rateLimit"
                      ? "contact-form-rate-limit"
                      : undefined
                }
              >
                {/* Name + Email row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium mb-2">
                      {t("name")} <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder={t("namePlaceholder")}
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={inputCls}
                    />
                    {errors.name && <p id="contact-name-error" role="alert" className="text-xs text-red-400 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
                      {t("email")} <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className={inputCls}
                    />
                    {errors.email && <p id="contact-email-error" role="alert" className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium mb-2">
                    {t("subject")}
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputCls}
                  >
                    {SUBJECT_KEYS.map((key, i) => (
                      <option key={key} value={SUBJECT_VALUES[i]}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium mb-2">
                    {t("message")} <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder={t("messagePlaceholder")}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                    className={`${inputCls} resize-y`}
                  />
                  {errors.message && <p id="contact-message-error" role="alert" className="text-xs text-red-400 mt-1">{errors.message}</p>}
                </div>

                {/* Error / rate limit banners */}
                {status === "error" && (
                  <p id="contact-form-error" role="alert" className="text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-xl">
                    {t("error")}
                  </p>
                )}
                {status === "rateLimit" && (
                  <p id="contact-form-rate-limit" role="alert" className="text-sm text-amber-400 bg-amber-500/10 px-4 py-3 rounded-xl">
                    {t("rateLimit")}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all cursor-pointer min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? t("sending") : t("submit")}
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>

        {/* Alternative contact info */}
        <AnimatedSection animation="fade-up" delay={200}>
          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
              {t("or")}
            </p>

            {/* Email */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                {t("emailUs")}
              </p>
              <a
                href={`mailto:${t("emailAddress")}`}
                className="text-[var(--color-primary)] font-semibold hover:underline"
              >
                {t("emailAddress")}
              </a>
            </div>

            {/* Social links */}
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              {t("socials")}
            </p>
            <div className="flex items-center justify-center gap-4">
              {[
                { href: "https://github.com/ai-educademy", label: "GitHub", icon: <GitHubIcon /> },
                { href: "https://linkedin.com/in/rameshreddy-adutla", label: "LinkedIn", icon: <LinkedInIcon /> },
                { href: "https://dev.to/rameshreddy-adutla", label: "Dev.to", icon: <DevToIcon /> },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all duration-200 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <p className="text-xs text-[var(--color-text-muted)] mt-6">
              {t("responseTime")}
            </p>
          </div>
        </AnimatedSection>

        {/* CTA to programs */}
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="mt-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-purple-500/10 border border-indigo-500/20 p-8 text-center">
            <div className="text-3xl mb-3">🌱</div>
            <h2 className="text-xl font-bold mb-2">Explore our learning programs</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-md mx-auto">
              Free, in your language, at your own pace.
            </p>
            <Link
              href={`${basePath}/programs`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow duration-300"
            >
              Browse Programs →
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
}
