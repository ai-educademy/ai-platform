import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://aieducademy.org";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const sitemaps = routing.locales
    .map((locale) => `  <sitemap><loc>${escapeXml(`${BASE_URL}/sitemap/${locale}.xml`)}</loc></sitemap>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>\n`;

  return new NextResponse(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
