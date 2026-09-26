---
emoji: "⚡"
name: Performance and Vitals
description: Keeps the site fast, because slow pages lose learners before they ever see the price.
on:
  schedule:
    - cron: "weekly on thursday"
  workflow_dispatch:
max-daily-ai-credits: 5000
permissions:
  contents: read
  pull-requests: read
  issues: read
# Free-tier budget: one run may use at most 60 model requests.
max-turns: 60
engine:
  id: gemini
  model: gemini-3.1-flash-lite-preview
  version: "0.39.1"
timeout-minutes: 25
strict: true
network:
  allowed: [defaults, node]
tools:
  cli-proxy: true
  edit:
  cache-memory: true
  bash: ["git *", "npm ci", "npm run *", "npx tsc *", "npx vitest *", "npx playwright *", "cat", "ls", "grep", "head", "du", "wc"]
  github:
    mode: gh-proxy
    toolsets: [repos, issues, pull_requests]
safe-outputs:
  # No Copilot token in this org; skip the AI pass. Agent PRs still need green CI.
  threat-detection:
    engine: false
  create-pull-request:
  create-issue:
    labels: [performance]
    close-older-issues: true
---

# Performance and Vitals

Core Web Vitals feed search ranking, and a slow page loses a learner before
they reach the price. Both reasons point the same way.

## Measure first

Never optimise on instinct. Build the site, run it, and take real numbers with
Playwright before you touch anything: Largest Contentful Paint, Cumulative
Layout Shift, Interaction to Next Paint, time to first byte. Measure the pages
that matter most, which are the homepage, the pricing page and a lesson page,
on both desktop and mobile profiles. Mobile is where this will be worst.

Then look for:

- **Bundle weight.** What is in the client bundle that should not be. A heavy
  dependency pulled in for one small helper. A library imported whole when one
  function was wanted. Code shipped to the browser that could stay on the server.
- **Server versus client components.** Anything marked `"use client"` that has
  no interactivity is shipping JavaScript for nothing.
- **Images.** Unoptimised formats, missing dimensions causing layout shift, no
  lazy loading below the fold, hero images not preloaded.
- **Fonts.** Blocking loads, missing `font-display`, no preconnect. Non-Latin
  scripts matter here: Devanagari, Telugu, Arabic, Chinese and Japanese fonts
  are large, and a naive setup ships all of them to everyone.
- **Waterfalls.** Sequential data fetches that could run in parallel, and data
  fetched on the client that could be fetched during render.
- **Caching.** Missing revalidation, dynamic rendering on pages that could be
  static.

## Rules

- One optimisation per pull request, with before and after numbers measured the
  same way. A pull request with no numbers is a guess.
- Never trade correctness for speed. Do not remove a loading state, drop an
  accessibility feature, or defer something the page needs to be right.
- If the honest answer is that the site is already fast enough, say so and open
  nothing. Micro-optimising a fast page burns review attention for no gain.
- Anything architectural, or anything touching payments, goes in an issue with
  your measurements, not a pull request.
