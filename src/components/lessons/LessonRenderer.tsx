import { MDXRemote } from "next-mdx-remote/rsc";
import { YouTubeEmbed } from "./YouTubeEmbed";
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

const components = {
  YouTube: YouTubeEmbed,
  Animation: LottieAnimation,
  Quiz,
  h1: AnimatedH1,
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
    <th className="px-3 sm:px-4 py-3 font-semibold text-[var(--color-text)] text-sm" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-3 sm:px-4 py-3 border-t border-[var(--color-border)] text-[var(--color-text-muted)] text-sm" {...props} />
  ),
  img: AnimatedImg,
  Illustration: AnimatedIllustration,
  Callout: AnimatedCallout,
  FunFact: AnimatedFunFact,
  ThinkAboutIt: AnimatedThinkAboutIt,
};

export function LessonRenderer({ content }: { content: string }) {
  return <MDXRemote source={content} components={components} />;
}
