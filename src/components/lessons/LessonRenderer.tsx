import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { normaliseMdxSource } from "@/lib/mdx-safety";
import { Quiz } from "./Quiz";
import { LottieAnimation } from "./LottieAnimation";
import {
  AnimatedH1,
  AnimatedH2,
  AnimatedH3,
  AnimatedP,
  AnimatedUL,
  AnimatedOL,
  AnimatedBlockquote,
  AnimatedPre,
  AnimatedTable,
  AnimatedImg,
  AnimatedIllustration,
  AnimatedCallout,
  AnimatedFunFact,
  AnimatedThinkAboutIt,
} from "./LessonElements";

const localePrefixes = new Set([
  "ar",
  "de",
  "es",
  "fr",
  "hi",
  "ja",
  "nl",
  "pt",
  "te",
  "zh",
]);

function localiseInternalHref(href: string | undefined, locale?: string) {
  if (!href) return href;
  let candidate = href;
  if (href.startsWith("https://aieducademy.org")) {
    const url = new URL(href);
    candidate = `${url.pathname}${url.search}${url.hash}`;
  }
  if (!candidate.startsWith("/")) return href;
  const [pathWithQuery, hash = ""] = candidate.split("#");
  const [pathname, query = ""] = pathWithQuery.split("?");
  const segments = pathname.split("/").filter(Boolean);
  const alreadyLocalised =
    segments.length > 0 && localePrefixes.has(segments[0]);
  const canonicalPath =
    pathname === "/experiments"
      ? "/lab"
      : pathname.startsWith("/blog/en/")
        ? pathname.replace(/^\/blog\/en\//, "/blog/")
        : pathname;
  const prefix =
    locale && locale !== "en" && !alreadyLocalised ? `/${locale}` : "";
  return `${prefix}${canonicalPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function createMdxLink(locale?: string) {
  function MdxLink({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    const localisedHref = localiseInternalHref(href, locale);
    if (localisedHref?.startsWith("/")) {
      return (
        <Link href={localisedHref} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={localisedHref} {...props}>
        {children}
      </a>
    );
  }
  return MdxLink;
}

const components = {
  Animation: LottieAnimation,
  Quiz,
  a: createMdxLink(),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <AnimatedH1 as="h2" {...props} />
  ),
  h2: AnimatedH2,
  h3: AnimatedH3,
  p: AnimatedP,
  ul: AnimatedUL,
  ol: AnimatedOL,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: AnimatedBlockquote,
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: AnimatedPre,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-[var(--color-text)]" {...props} />
  ),
  table: AnimatedTable,
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[var(--color-primary)]/10 text-left" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-3 sm:px-4 py-3 font-semibold text-[var(--color-text)] text-sm"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-3 sm:px-4 py-3 border-t border-[var(--color-border)] text-[var(--color-text-muted)] text-sm"
      {...props}
    />
  ),
  img: AnimatedImg,
  Illustration: AnimatedIllustration,
  Callout: AnimatedCallout,
  FunFact: AnimatedFunFact,
  ThinkAboutIt: AnimatedThinkAboutIt,
};

export function LessonRenderer({
  content,
  locale,
  extraComponents,
}: {
  content: string;
  locale?: string;
  extraComponents?: Partial<typeof components>;
}) {
  const localisedComponents = locale
    ? { ...components, a: createMdxLink(locale) }
    : components;
  const merged = extraComponents
    ? { ...localisedComponents, ...extraComponents }
    : localisedComponents;
  return <MDXRemote source={normaliseMdxSource(content)} components={merged} />;
}
