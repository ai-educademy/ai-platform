"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const SPRING = "cubic-bezier(0.22, 1, 0.36, 1)";

function useElementInView(margin = "-60px") {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIsInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: margin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);

  return { ref, isInView };
}

/* ── Animated MDX elements ── */

export function AnimatedH1({
  as: Tag = "h1",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" }) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className="text-3xl font-bold mt-8 mb-4 text-[var(--color-primary)]"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateX(-24px)",
              transition: `opacity 0.5s ${SPRING}, transform 0.5s ${SPRING}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedH2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <h2
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className="text-2xl font-bold mt-8 mb-3"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateX(-24px)",
              transition: `opacity 0.5s ${SPRING}, transform 0.5s ${SPRING}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedH3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <h3
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className="text-xl font-semibold mt-6 mb-2"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateX(-24px)",
              transition: `opacity 0.5s ${SPRING}, transform 0.5s ${SPRING}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedP(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <p
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className="text-lg leading-relaxed mb-4 text-[var(--color-text-muted)]"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transition: `opacity 0.4s ${EASE}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedUL(props: React.HTMLAttributes<HTMLUListElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <ul
      ref={ref as React.RefObject<HTMLUListElement>}
      className="list-disc list-inside space-y-2 mb-4 text-lg text-[var(--color-text-muted)]"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedOL(props: React.HTMLAttributes<HTMLOListElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <ol
      ref={ref as React.RefObject<HTMLOListElement>}
      className="list-decimal list-inside space-y-2 mb-4 text-lg text-[var(--color-text-muted)]"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedBlockquote(
  props: React.HTMLAttributes<HTMLQuoteElement>,
) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <blockquote
      ref={ref as React.RefObject<HTMLQuoteElement>}
      className="border-l-4 border-[var(--color-primary)] pl-4 py-2 my-4 bg-[var(--color-primary)]/5 rounded-r-lg italic text-lg"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedPre(props: React.HTMLAttributes<HTMLPreElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <pre
      ref={ref as React.RefObject<HTMLPreElement>}
      className="bg-[#1e293b] text-[#e2e8f0] p-4 sm:p-6 rounded-xl overflow-x-auto my-6 text-sm shadow-lg shadow-black/20"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "scale(0.95)",
              transition: `opacity 0.5s ${SPRING}, transform 0.5s ${SPRING}`,
            }
      }
      {...props}
    />
  );
}

export function AnimatedTable(props: React.HTMLAttributes<HTMLTableElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="overflow-x-auto my-6 rounded-xl border border-[var(--color-border)]"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
    >
      <table className="w-full text-sm" {...props} />
    </div>
  );
}

export function AnimatedImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className="block my-8"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "scale(0.95)",
              transition: `opacity 0.5s ${SPRING}, transform 0.5s ${SPRING}`,
            }
      }
    >
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
  );
}

export function AnimatedIllustration({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <figure
      ref={ref as React.RefObject<HTMLElement>}
      className="my-8"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "scale(0.95)",
              transition: `opacity 0.5s ${SPRING}, transform 0.5s ${SPRING}`,
            }
      }
    >
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
  );
}

export function AnimatedCallout({
  type = "info",
  children,
}: {
  type?: "info" | "tip" | "warning";
  children: React.ReactNode;
}) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  const styles = {
    info: "border-[var(--color-primary)] bg-[var(--color-primary)]/8",
    tip: "border-[var(--color-accent)] bg-[var(--color-accent)]/8",
    warning: "border-[var(--color-secondary)] bg-[var(--color-secondary)]/8",
  };
  const icons = { info: "💡", tip: "✅", warning: "⚠️" };
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`border-l-4 p-5 my-6 rounded-r-xl ${styles[type]}`}
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{icons[type]}</span>
        <div className="text-[var(--color-text)] text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AnimatedFunFact({ children }: { children: React.ReactNode }) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-6 my-6"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🤯</span>
        <div className="text-[var(--color-text)]">{children}</div>
      </div>
    </div>
  );
}

export function AnimatedThinkAboutIt({
  children,
}: {
  children: React.ReactNode;
}) {
  const noMotion = useReducedMotion();
  const { ref, isInView } = useElementInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="bg-[var(--color-secondary)]/8 border border-[var(--color-secondary)]/20 rounded-2xl p-6 my-6"
      style={
        noMotion
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateY(20px)",
              transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
            }
      }
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🤔</span>
        <div className="text-[var(--color-text)]">
          <strong className="block mb-1 text-[var(--color-secondary)]">
            Think about it:
          </strong>
          {children}
        </div>
      </div>
    </div>
  );
}
