---
emoji: "♿"
name: Accessibility Auditor
description: Makes sure the courses are usable by everyone, in every one of the 11 languages.
on:
  schedule:
    - cron: "weekly on friday"
  workflow_dispatch:
max-daily-ai-credits: 5000
permissions:
  contents: read
  pull-requests: read
  issues: read
# Free-tier budget: one run may use at most 60 model requests.
max-turns: 60
max-turn-cache-misses: 60
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
  bash: ["safeoutputs *", "git *", "npm ci", "npm run *", "npx tsc *", "npx vitest *", "npx playwright *", "cat", "ls", "grep", "head"]
  github:
    mode: gh-proxy
    toolsets: [repos, issues, pull_requests]
safe-outputs:
  # No Copilot token in this org; skip the AI pass. Agent PRs still need green CI.
  threat-detection:
    engine: false
  create-pull-request:
  create-issue:
    labels: [accessibility]
    close-older-issues: true
---

# Accessibility Auditor

This is a teaching platform. Someone who cannot use it cannot learn from it,
and cannot pay for it either. Target WCAG 2.2 AA.

## Audit

Drive the real site with Playwright rather than reading the source and
guessing. Check the homepage, pricing, a programme page and a lesson page, on
desktop and mobile, in several locales including **Arabic**, because
right-to-left layouts surface bugs nothing else does.

- **Keyboard.** Every interactive element reachable by Tab, in a sensible
  order, with a visible focus ring. No traps. Modals return focus where they
  found it. A skip link to the main content.
- **Screen readers.** Images have meaningful alt text, or empty alt when
  decorative. Form controls have real labels, not just placeholders. Buttons
  say what they do rather than "click here". Icon-only buttons have accessible
  names. Landmarks and heading levels are used properly and do not skip.
- **Contrast.** Text against its background, and the focus indicator too. Check
  both light and dark themes if both exist.
- **Motion and timing.** Honour `prefers-reduced-motion`. Nothing that moves or
  auto-advances without a way to stop it.
- **Dynamic content.** Live regions announce what changed. Loading and error
  states are announced, not only shown.
- **Language.** The `lang` attribute matches the actual content language, and
  `dir="rtl"` is set for Arabic. This is frequently wrong and it silently
  breaks screen reader pronunciation for an entire locale.
- **Video and audio** have captions or transcripts.

## Rules

- One area per pull request, stating the barrier and who it excluded.
- Fix the cause. Adding `aria-label` to paper over a `div` pretending to be a
  button is worse than using a button. Prefer correct semantic HTML to ARIA
  every time, because wrong ARIA is worse than none.
- Every fix ships with a test where one is possible.
- Verify by actually driving the page again, not by asserting the fix worked.
- Anything needing a design change or new copy goes in an issue with evidence.

## Mandatory final step

Your run is only recorded if you finish with a safe-output call. Ending with a plain-text summary counts as a failed run.

- If you found something actionable, use the matching safe output (for example `create_issue` or `create_pull_request`).
- If there is nothing to report, run exactly this shell command, with your one-line summary as the message:

```bash
safeoutputs noop '{"message":"<one-line summary of what you checked and found>"}'
```

Do not stop until one of these calls has succeeded.
