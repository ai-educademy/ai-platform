/* global process */
import withSerwist from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
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
      // Lessons moved from ai-polish → career-ready programs
      {
        source: "/:locale/programs/ai-polish/lessons/star-framework",
        destination: "/:locale/programs/ai-behavioral/lessons/star-framework",
        permanent: true,
      },
      {
        source: "/:locale/programs/ai-polish/lessons/behavioural-interview-mastery",
        destination: "/:locale/programs/ai-behavioral/lessons/behavioural-interview-mastery",
        permanent: true,
      },
      {
        source: "/:locale/programs/ai-polish/lessons/career-transitions-to-ai",
        destination: "/:locale/programs/ai-launchpad/lessons/career-transitions-to-ai",
        permanent: true,
      },
      {
        source: "/:locale/programs/ai-polish/lessons/negotiating-your-offer",
        destination: "/:locale/programs/ai-offer/lessons/negotiating-your-offer",
        permanent: true,
      },
      {
        source: "/:locale/programs/ai-polish/lessons/salary-benchmarking",
        destination: "/:locale/programs/ai-offer/lessons/salary-benchmarking",
        permanent: true,
      },
      {
        source: "/:locale/programs/ai-polish/lessons/building-personal-brand",
        destination: "/:locale/programs/ai-offer/lessons/building-personal-brand",
        permanent: true,
      },
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
