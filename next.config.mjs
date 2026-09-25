/* global process */
import withSerwist from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import { readFileSync } from "node:fs";
import { URL } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // Google Analytics was being refused by this policy on every page load in
    // production, so the site has been collecting no analytics and no
    // conversion data at all. The tag is injected by the Vercel integration
    // rather than by code, which is why nothing in src referenced it.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://*.vercel-storage.com https://www.google-analytics.com",
      "font-src 'self' data:",
      "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.vercel.live wss://*.vercel.live https://api.github.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

// Lessons that moved out of ai-polish. English has no locale prefix, so each
// move needs both forms or /programs/ai-polish/... keeps serving a duplicate.
// Single source of truth shared with getLessons() and the sitemap.
const MOVED_LESSONS = Object.entries(
  JSON.parse(
    readFileSync(
      new URL("./src/lib/moved-lessons.json", import.meta.url),
      "utf8",
    ),
  ),
).flatMap(([from, lessons]) =>
  Object.entries(lessons).map(([slug, program]) => [slug, program, from]),
);

const movedLessonRedirects = MOVED_LESSONS.flatMap(([slug, program, from]) => [
  {
    source: `/:locale(ar|de|es|fr|hi|ja|nl|pt|te|zh)/programs/${from}/lessons/${slug}`,
    destination: `/:locale/programs/${program}/lessons/${slug}`,
    permanent: true,
  },
  {
    source: `/programs/${from}/lessons/${slug}`,
    destination: `/programs/${program}/lessons/${slug}`,
    permanent: true,
  },
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.aieducademy.org" }],
        destination: "https://aieducademy.org/:path*",
        permanent: true,
      },
      // The playground became the lab; old links and bookmarks must not 404.
      { source: "/playground", destination: "/lab", permanent: true },
      { source: "/en/playground", destination: "/lab", permanent: true },
      {
        source: "/:locale(ar|de|es|fr|hi|ja|nl|pt|te|zh)/playground",
        destination: "/:locale/lab",
        permanent: true,
      },
      ...movedLessonRedirects,
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        // Google is the most used sign in provider here, and its avatars are
        // served from this host. Without it next/image refuses every Google
        // account's picture and everyone falls back to initials.
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  poweredByHeader: false,
};

const withPWA = withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withPWA(withNextIntl(withMDX(nextConfig)));
