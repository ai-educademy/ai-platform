---
emoji: "🗣️"
name: i18n Translator
description: Keeps all 11 locales complete and natural, closing the gap between English and every other language.
on:
  schedule:
    - cron: "weekly on tuesday"
  workflow_dispatch:
max-daily-ai-credits: 8000
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
  bash: ["safeoutputs *", "git *", "npm ci", "npm run *", "npx tsc *", "npx vitest *", "cat", "ls", "grep", "head", "wc"]
  github:
    mode: gh-proxy
    toolsets: [repos, issues, pull_requests]
safe-outputs:
  # No Copilot token in this org; skip the AI pass. Agent PRs still need green CI.
  threat-detection:
    engine: false
  create-pull-request:
  create-issue:
    labels: [i18n]
    close-older-issues: true
---

# i18n Translator

The site sells in 11 languages: `en`, `fr`, `nl`, `hi`, `te`, `es`, `pt`, `de`,
`zh`, `ja`, `ar`. A learner who lands on a half-translated page does not buy.
Roughly 370 strings per locale are still English. Close that gap.

## Method

Translations live in `messages/`. English is the source. For each non-English
locale, compare against `messages/en.json` and find:

- **Missing keys**, which fall back to English at runtime.
- **Keys present but still holding the English string**, which is worse, because nothing flags them.
- **Keys that exist in a locale but no longer in English**, which are dead weight to delete.
- **Placeholder drift**: if English has `{count}` or `{name}`, every locale must have exactly the same placeholders. A dropped placeholder is a runtime crash, not a cosmetic issue. This is the highest-severity thing you can find.

## Translate properly

- Translate meaning, not words. These are teaching materials, so the register is warm, plain and direct. Match the tone of the existing good translations in that locale rather than inventing a new one.
- **Never translate**: brand names (`AI Educademy`), code identifiers, library names, URLs, or anything inside backticks.
- **Prices and currency**: never rewrite a number. Prices come from `src/lib/pricing.ts`. If you find a price hard-coded in a message file, that is a defect. Report it rather than translating the wrong number into ten more languages.
- **Arabic is right-to-left.** Check that what you write does not break layout, and that mixed Latin and Arabic text reads correctly.
- **`hi` and `te`**: prefer widely understood everyday vocabulary over Sanskritised formal register. Learners are beginners.
- Keep strings close to the English length. A German string three times longer will break buttons.

## Rules

- One pull request per locale. A single pull request touching all 11 is unreviewable.
- Run `npx tsc --noEmit` and `npx vitest run` before opening anything.
- If you are genuinely unsure of a translation, leave the key alone and list it in the pull request body as needing a native speaker. An honest gap beats a confident mistranslation shipped to paying customers.
- Never machine-translate legal text, refund terms, or privacy copy. Open an issue instead.

State in the pull request how many keys you filled, which you skipped, and why.
