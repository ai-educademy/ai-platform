import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Providers } from "@/components/ui/Providers";

import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { ChatWidget } from "@/components/ui/chat/ChatWidget";
import { ReferralTracker } from "@/components/ReferralTracker";

import { buildAlternates } from "@/lib/seo";

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
  const t = await getTranslations({ locale, namespace: "meta" });

  const canonicalUrl = locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t("title"),
      template: `%s | AI Educademy`,
    },
    description: t("description"),
    keywords: [
      "AI education",
      "artificial intelligence",
      "free AI course",
      "learn AI",
      "machine learning",
      "open source education",
      "multilingual AI",
      "beginner AI",
      "AI for beginners",
      "AI school",
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
      title: t("title"),
      description: t("description"),
      type: "website",
      siteName: "AI Educademy",
      locale: locale,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: "AI Educademy",
      description: t("description"),
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
const themeScript = `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.add('light')}})()`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning className={inter.variable}>
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
        <OrganizationJsonLd />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ChatWidget />
            <ReferralTracker />
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
