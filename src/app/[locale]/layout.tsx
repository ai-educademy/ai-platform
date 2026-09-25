import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/locales";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Providers } from "@/components/ui/Providers";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

import { ChatWidget } from "@/components/ui/chat/ChatWidget";
import { ReferralTracker } from "@/components/ReferralTracker";

import { buildAlternates, getPageSeo, SOCIAL_IMAGE_URL } from "@/lib/seo";

const BASE_URL = "https://aieducademy.org";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const pageSeo = getPageSeo(locale, "home");
  // The homepage has no template applied, so the brand has to be in the copy
  // or branded searches land on a title that never names the site.
  const seo = {
    ...pageSeo,
    title: pageSeo.title.includes("AI Educademy")
      ? pageSeo.title
      : `AI Educademy: ${pageSeo.title}`,
  };

  const canonicalUrl = locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: seo.title,
      template: `%s | AI Educademy`,
    },
    description: seo.description,
    keywords: [
      "AI education",
      "artificial intelligence",
      "learn AI online",
      "AI certification",
      "learn AI",
      "machine learning",
      "AI interview preparation",
      "machine learning interview",
      "system design interview",
      "multilingual AI",
      "beginner AI",
      "AI for beginners",
      "AI educademy",
      "ai educademy",
      "educación IA",
      "aprender inteligencia artificial",
      "KI Lernen",
      "AI Bildung",
      "educação em IA",
    ],
    authors: [{ name: "Ramesh Reddy Adutla" }],
    creator: "Ramesh Reddy Adutla",
    publisher: "AI Educademy",
    alternates: {
      canonical: canonicalUrl,
      ...buildAlternates(""),
      types: {
        "application/rss+xml": `${BASE_URL}/feed.xml`,
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      siteName: "AI Educademy",
      locale: locale,
      url: canonicalUrl,
      images: [
        {
          url: SOCIAL_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "AI Educademy multilingual AI learning platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [SOCIAL_IMAGE_URL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      // Add Google Search Console verification when available
      google: "sy_cBywtczFwB5llz4Glcgpo_qdYRfXIgisrBL5E6Yw",
    },
    category: "education",
  };
}

// Inline script to set theme class before paint (prevents flash)
/**
 * Environment variables set through a dashboard very easily pick up a trailing
 * newline from a copy and paste, and this one is interpolated straight into a
 * single quoted string inside the Google Analytics init script. A newline
 * there makes it an unterminated string literal, so the whole init script
 * throws `SyntaxError: Invalid or unexpected token` and no page view is ever
 * recorded. That is exactly what production was doing, silently, on every
 * page load. Trimming costs nothing and makes the value safe however it was
 * entered.
 */
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim() || undefined;

const themeScript = `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.add('light')}})()`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // The proxy matcher skips any path containing a dot, so requests like
  // `/unknown.txt` reach this catch-all with a bogus locale. Without this check
  // the request config falls back to English and the homepage is served at 200,
  // which hands search engines unlimited duplicate URLs for the same content.
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://github.com" />
      </head>
      <body className="antialiased">
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <EmailVerificationBanner />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ChatWidget />
            {/* useSearchParams() opts the whole tree out of static rendering
                unless it sits behind a Suspense boundary. This component only
                runs effects and renders null, so there is nothing to fall back
                to. */}
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
