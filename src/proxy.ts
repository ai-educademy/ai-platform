import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getLesson } from "./lib/lessons";
import { getProgram } from "./lib/programs";

const intlMiddleware = createMiddleware(routing);

function splitLocalisedPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = routing.locales.includes(firstSegment as (typeof routing.locales)[number]);

  return {
    locale: hasLocale ? firstSegment : routing.defaultLocale,
    segments: hasLocale ? segments.slice(1) : segments,
  };
}

function notFoundResponse(request: NextRequest) {
  if (request.method === "HEAD") {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(
    "<!doctype html><html><head><title>404</title><meta name=\"robots\" content=\"noindex, nofollow\"></head><body><h1>404</h1><p>Page not found</p></body></html>",
    {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

export default function proxy(request: NextRequest) {
  const { locale, segments } = splitLocalisedPath(request.nextUrl.pathname);

  if (segments[0] === "programs" && segments[1]) {
    const programSlug = segments[1];
    const lessonSlug = segments[3];

    if (!getProgram(programSlug)) {
      return notFoundResponse(request);
    }

    if (segments[2] === "lessons" && lessonSlug && !getLesson(programSlug, locale, lessonSlug)) {
      return notFoundResponse(request);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|sw\\.js|workbox-.*|.*\\..*).*)"],
};
