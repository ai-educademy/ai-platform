"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  COUNTRY_COOKIE,
  countryFromLocale,
  countryToRegion,
  type Region,
} from "@/lib/geo";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export interface CountryState {
  /** ISO alpha-2 code, or null until known. */
  country: string | null;
  region: Region;
}

/**
 * The visitor's country and derived region, for targeting offers and ads.
 *
 * Reads the `country` cookie stamped by the proxy from Vercel's geo header, so
 * the page it runs on can stay statically rendered. Falls back to a locale guess
 * when the cookie is absent (local development or the very first request), and
 * to GLOBAL when nothing is known. Resolved in an effect to avoid a hydration
 * mismatch, since the server render has no access to the cookie.
 */
export function useCountry(): CountryState {
  const locale = useLocale();
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    const fromCookie = readCookie(COUNTRY_COOKIE);
    setCountry(fromCookie || countryFromLocale(locale));
  }, [locale]);

  return { country, region: countryToRegion(country) };
}
