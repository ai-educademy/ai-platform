"use client";

import dynamic from "next/dynamic";

export const HomeProgramCardsLazy = dynamic(
  () => import("@/components/home/HomeProgramCards"),
  { ssr: false },
);

export const HomeFounderLazy = dynamic(
  () => import("@/components/home/HomeFounder"),
  { ssr: false },
);

export const HomeCommunitySectionLazy = dynamic(
  () => import("@/components/home/HomeCommunitySection"),
  { ssr: false },
);
