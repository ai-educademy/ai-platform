import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getBlogPost } from "./lib/blog";
import { getLesson, getLessons } from "./lib/lessons";
import { getProgram, getPrograms } from "./lib/programs";
import { COUNTRY_COOKIE } from "./lib/geo";

const intlMiddleware = createMiddleware(routing);

function splitLocalisedPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = routing.locales.includes(
    firstSegment as (typeof routing.locales)[number],
  );

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
    '<!doctype html><html><head><title>404</title><meta name="robots" content="noindex, nofollow"></head><body><h1>404</h1><p>Page not found</p></body></html>',
    {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}

function permanentRedirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, 308);
}

// Legacy /lessons URLs are still linked from old posts and shares. A page-level
// redirect on a prerendered route is served as a 200 with a meta refresh, which
// Google reports as a soft 404, so they are redirected here with a real 308.
function legacyLessonRedirect(
  request: NextRequest,
  locale: string,
  segments: string[],
) {
  if (segments[0] !== "lessons" || segments.length > 2) return null;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  if (!segments[1]) return permanentRedirectTo(request, `${basePath}/programs`);

  const owner = getPrograms().find((program) =>
    getLessons(program.slug, locale).some(
      (lesson) => lesson.slug === segments[1],
    ),
  );
  if (!owner) return notFoundResponse(request);
  return permanentRedirectTo(
    request,
    `${basePath}/programs/${owner.slug}/lessons/${segments[1]}`,
  );
}

export default function proxy(request: NextRequest) {
  const { locale, segments } = splitLocalisedPath(request.nextUrl.pathname);

  const legacy = legacyLessonRedirect(request, locale, segments);
  if (legacy) return legacy;

  if (segments[0] === "programs" && segments[1]) {
    const programSlug = segments[1];
    const lessonSlug = segments[3];

    if (!getProgram(programSlug)) {
      return notFoundResponse(request);
    }

    if (
      segments[2] === "lessons" &&
      lessonSlug &&
      !getLesson(programSlug, locale, lessonSlug)
    ) {
      return notFoundResponse(request);
    }
  }

  if (
    segments[0] === "blog" &&
    segments[1] &&
    !getBlogPost(segments[1], locale)
  ) {
    return notFoundResponse(request);
  }

  const response = intlMiddleware(request);

  // Stamp the visitor's country into a client-readable cookie so static pages
  // (e.g. the tools directory) can tailor offers by region without becoming
  // dynamic. Vercel injects x-vercel-ip-country at the edge; absent locally.
  const country = request.headers.get("x-vercel-ip-country");
  if (country && response) {
    response.cookies.set(COUNTRY_COOKIE, country.toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/:locale(en|fr|nl|hi|te|es|pt|de|zh|ja|ar)?",
    "/:locale(en|fr|nl|hi|te|es|pt|de|zh|ja|ar)?/:path(about|achievement|admin|blog|bookmarks|contact|dashboard|faq|forgot-password|journey|lab|lessons|mock-interview|offline|onboarding|pricing|privacy|programs|reset-password|resources|signin|signup|terms|tools|unsubscribe|verify-email)(.*)",
  ],
};
