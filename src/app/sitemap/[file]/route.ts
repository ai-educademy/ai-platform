import { NextResponse } from "next/server";
import { buildSitemapEntries } from "@/lib/sitemap";
import { routing } from "@/i18n/routing";

// Built once per deploy. Reading content and Git history per request would run
// inside a lambda that has neither.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ file: `${locale}.xml` }));
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatLastModified(value: string | Date | undefined): string {
  if (!value) return "";
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const locale = file.replace(/\.xml$/, "");
  if (
    !file.endsWith(".xml") ||
    !(routing.locales as readonly string[]).includes(locale)
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const urls = buildSitemapEntries(locale)
    .map((entry) => {
      const alternates = entry.alternates?.languages ?? {};
      const alternateXml = Object.entries(alternates)
        .filter(
          (alternate): alternate is [string, string] =>
            typeof alternate[1] === "string",
        )
        .map(
          ([hreflang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`,
        )
        .join("\n");
      const lastModified = formatLastModified(entry.lastModified);

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        lastModified ? `    <lastmod>${escapeXml(lastModified)}</lastmod>` : "",
        alternateXml,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;

  return new NextResponse(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
