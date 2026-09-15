"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type ProStatus = {
  isPro: boolean;
  /** True until the answer is known. Callers should render nothing meanwhile. */
  loading: boolean;
};

type StatusResponse = { plan?: string; isPro?: boolean };

/**
 * Shared across every component that asks during a page view.
 *
 * The upgrade prompt appears in the navbar, the user menu and inline on several
 * pages. Without this each one would issue its own identical request on every
 * navigation.
 */
let inFlight: Promise<StatusResponse> | null = null;

/** Clears the cached answer. Call after anything that can change the plan. */
export function resetProStatus(): void {
  inFlight = null;
}

function fetchStatus(): Promise<StatusResponse> {
  inFlight ??= fetch("/api/subscription/status", { credentials: "same-origin" })
    .then((res) => (res.ok ? res.json() : { isPro: false }))
    .catch(() => ({ isPro: false }));
  return inFlight;
}

/**
 * Whether the current viewer already has Pro.
 *
 * Deliberately not read from the session token: `role` is baked into the JWT at
 * sign in, but the Stripe webhook promotes the user in the database, so a token
 * minted before checkout still reports "free". Trusting it would keep nagging
 * somebody who has just paid.
 */
export function useProStatus(): ProStatus {
  const { status } = useSession();
  const [state, setState] = useState<ProStatus>({ isPro: false, loading: true });

  useEffect(() => {
    if (status === "loading") return;

    // An anonymous visitor is never Pro, so skip the request entirely. Clearing
    // the cache here also stops a previous user's answer leaking across a sign
    // out and back in as somebody else.
    if (status === "unauthenticated") {
      resetProStatus();
      setState({ isPro: false, loading: false });
      return;
    }

    let active = true;
    fetchStatus().then((data) => {
      if (active) setState({ isPro: Boolean(data.isPro), loading: false });
    });
    return () => {
      active = false;
    };
  }, [status]);

  return state;
}

/**
 * Whether to show an upgrade prompt.
 *
 * Separate from `isPro` because the two differ while loading: showing the
 * prompt before the answer arrives makes it flash in front of subscribers on
 * every page load.
 */
export function useShouldPromptUpgrade(): boolean {
  const { isPro, loading } = useProStatus();
  return !loading && !isPro;
}
