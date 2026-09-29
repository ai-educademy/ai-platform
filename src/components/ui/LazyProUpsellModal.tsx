"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useShouldPromptUpgrade } from "@/hooks/useProStatus";

const ProUpsellModal = dynamic(
  () => import("./ProUpsellModal").then((m) => m.ProUpsellModal),
  { ssr: false },
);

/** Set once the viewer ticks "do not show again". Survives across sessions. */
const DISMISSED_KEY = "aie:proUpsellDismissed";
/** Set once shown in a tab, so a single close does not let it pop again. */
const SEEN_KEY = "aie:proUpsellSeen";

/** Delay before the prompt appears, giving the visitor time to read first. */
const APPEAR_DELAY_MS = 18000;

/**
 * Routes where the prompt would be noise rather than signal: the pricing page
 * already makes the case, and the checkout and account flows are mid-purchase
 * or post-purchase.
 */
const SUPPRESSED = ["/pricing", "/checkout", "/billing", "/account", "/admin"];

function isSuppressedPath(pathname: string): boolean {
  // Strip a leading locale segment so "/fr/pricing" matches "/pricing".
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const path = withoutLocale === "" ? "/" : withoutLocale;
  return SUPPRESSED.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Decides whether, and when, to show the paid-plan prompt, then defers loading
 * the modal bundle until it is actually needed.
 *
 * Shows at most once per session, never to a subscriber, never after a
 * permanent dismissal, and never on the pages listed above. The bundle is only
 * imported when all of those pass, so it costs a visitor who never sees it
 * nothing beyond this small gate.
 */
export function LazyProUpsellModal() {
  const shouldPrompt = useShouldPromptUpgrade();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldPrompt) return;
    if (isSuppressedPath(pathname)) return;

    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
      if (sessionStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      // Storage can throw in private mode; fall through and show once.
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setOpen(true);
    }, APPEAR_DELAY_MS);

    return () => clearTimeout(timer);
  }, [shouldPrompt, pathname]);

  const handleClose = useCallback((dontShowAgain: boolean) => {
    setOpen(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(DISMISSED_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!open) return null;
  return <ProUpsellModal onClose={handleClose} />;
}

export default LazyProUpsellModal;
