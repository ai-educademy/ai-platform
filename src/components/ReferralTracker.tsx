"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function ReferralTracker() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Store referral code from URL into localStorage and cookie
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (!refCode) return;

    localStorage.setItem("ref_code", refCode);
    document.cookie = `ref_code=${encodeURIComponent(refCode)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }, [searchParams]);

  // When user signs in, submit the referral
  useEffect(() => {
    if (!session?.user?.id) return;

    const refCode =
      localStorage.getItem("ref_code") ??
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("ref_code="))
        ?.split("=")[1];

    if (!refCode) return;

    fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: decodeURIComponent(refCode) }),
    })
      .then((res) => {
        if (res.ok || res.status === 409) {
          // Clear referral code after successful submission or duplicate
          localStorage.removeItem("ref_code");
          document.cookie =
            "ref_code=; path=/; max-age=0; SameSite=Lax";
        }
      })
      .catch(() => {
        // Silently fail — will retry on next page load
      });
  }, [session?.user?.id]);

  return null;
}
