import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://aieducademy.org";
const PRIVATE_PATHS = [
  "/admin/",
  "/bookmarks/",
  "/dashboard/",
  "/forgot-password/",
  "/onboarding/",
  "/reset-password/",
  "/signin/",
  "/signup/",
  "/unsubscribe/",
  "/verify-email/",
];

const localizedPrivatePaths = routing.locales.flatMap((locale) =>
  PRIVATE_PATHS.map((privatePath) =>
    locale === routing.defaultLocale ? privatePath : `/${locale}${privatePath}`
  )
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...localizedPrivatePaths],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
