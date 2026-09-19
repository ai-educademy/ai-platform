import type { Metadata } from "next";
import { buildAlternates, localeUrl } from "@/lib/seo";

export const BASE_URL = "https://aieducademy.org";
export const SITE_NAME = "AI Educademy";
export const SOCIAL_IMAGE_URL = `${BASE_URL}/social-preview.png`;

export function canonicalUrl(locale: string, path: string): string {
  return localeUrl(locale, path);
}

function titleWithSite(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function createSeoMetadata({
  locale,
  path,
  title,
  description,
  type = "website",
  imageUrl = SOCIAL_IMAGE_URL,
  imageAlt = "AI Educademy multilingual AI learning platform",
  robots,
  openGraph,
  twitter,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  imageUrl?: string;
  imageAlt?: string;
  robots?: Metadata["robots"];
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
}): Metadata {
  const canonical = canonicalUrl(locale, path);
  const titled = titleWithSite(title);

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: {
      canonical,
      ...buildAlternates(path),
    },
    openGraph: {
      title: titled,
      description,
      url: canonical,
      type,
      siteName: SITE_NAME,
      locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: titled,
      description,
      images: [imageUrl],
      ...twitter,
    },
    ...(robots ? { robots } : {}),
  };
}
