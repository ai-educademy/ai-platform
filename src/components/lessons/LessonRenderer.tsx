import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { Quiz } from "./Quiz";

const components = {
  YouTube: YouTubeEmbed,
  Animation: () => null,
  Quiz,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-[var(--color-primary)]" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mt-8 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-lg leading-relaxed mb-4 text-[var(--color-text-muted)]" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside space-y-2 mb-4 text-lg text-[var(--color-text-muted)]" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 text-lg text-[var(--color-text-muted)]" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-[var(--color-primary)] pl-4 py-2 my-4 bg-[var(--color-primary)]/5 rounded-r-lg italic text-lg"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-[#1e293b] text-[#e2e8f0] p-6 rounded-xl overflow-x-auto my-6 text-sm"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-[var(--color-text)]" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[var(--color-primary)]/10 text-left" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 font-semibold text-[var(--color-text)]" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 border-t border-[var(--color-border)] text-[var(--color-text-muted)]" {...props} />
  ),
  // Image component for MDX
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="block my-8">
      <span className="block rounded-2xl border border-[var(--color-border)] overflow-hidden bg-white">
        <Image
          src={String(props.src || "")}
          alt={props.alt || ""}
          width={720}
          height={280}
          className="w-full h-auto"
          unoptimized={String(props.src || "").endsWith(".svg")}
        />
      </span>
      {props.alt && (
        <span className="block text-center text-sm text-[var(--color-text-muted)] mt-3 italic">
          {props.alt}
        </span>
      )}
    </span>
  ),
  // Illustration component for diagrams — wrapped in light bg for dark mode visibility
  Illustration: ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
    <figure className="my-8">
      <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-white shadow-sm">
        <Image
          src={src}
          alt={alt}
          width={720}
          height={280}
          className="w-full h-auto"
          unoptimized={src.endsWith(".svg")}
        />
      </div>
      {(caption || alt) && (
        <figcaption className="text-center text-sm text-[var(--color-text-muted)] mt-3 italic">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  ),
  // Theme-aware callout component
  Callout: ({
    type = "info",
    children,
  }: {
    type?: "info" | "tip" | "warning";
    children: React.ReactNode;
  }) => {
    const styles = {
      info: "border-[var(--color-primary)] bg-[var(--color-primary)]/8",
      tip: "border-[var(--color-accent)] bg-[var(--color-accent)]/8",
      warning: "border-[var(--color-secondary)] bg-[var(--color-secondary)]/8",
    };
    const icons = { info: "💡", tip: "✅", warning: "⚠️" };
    return (
      <div className={`border-l-4 p-5 my-6 rounded-r-xl ${styles[type]}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">{icons[type]}</span>
          <div className="text-[var(--color-text)] text-base leading-relaxed">{children}</div>
        </div>
      </div>
    );
  },
  // Theme-aware fun fact box
  FunFact: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🤯</span>
        <div className="text-[var(--color-text)]">{children}</div>
      </div>
    </div>
  ),
  // Theme-aware think about it box
  ThinkAboutIt: ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[var(--color-secondary)]/8 border border-[var(--color-secondary)]/20 rounded-2xl p-6 my-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🤔</span>
        <div className="text-[var(--color-text)]">
          <strong className="block mb-1 text-[var(--color-secondary)]">Think about it:</strong>
          {children}
        </div>
      </div>
    </div>
  ),
};

export function LessonRenderer({ content }: { content: string }) {
  return <MDXRemote source={content} components={components} />;
}
