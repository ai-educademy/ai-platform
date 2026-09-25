"use client";

import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const CommandPaletteInner = dynamic(
  () => import("./CommandPaletteInner").then((m) => m.CommandPaletteInner),
  { ssr: false },
);

export function CommandPalette() {
  const t = useTranslations("nav");
  const [loaded, setLoaded] = useState(false);
  const [initialOpen, setInitialOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLoaded(true);
        setInitialOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (loaded) {
    return <CommandPaletteInner initialOpen={initialOpen} />;
  }

  return (
    <button
      type="button"
      onClick={() => {
        setLoaded(true);
        setInitialOpen(true);
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-text)]/[0.06] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      aria-label={t("search") ?? "Search"}
    >
      <Search className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
