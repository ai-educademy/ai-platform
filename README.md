<div align="center">

# AI Educademy

### Multilingual AI and software engineering education, from first lesson to interview ready

[![CI](https://github.com/ai-educademy/ai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-educademy/ai-platform/actions/workflows/ci.yml)
[![Licence](https://img.shields.io/github/license/ai-educademy/ai-platform)](LICENSE)
[![Website](https://img.shields.io/badge/Website-aieducademy.org-6366f1)](https://aieducademy.org)
[![Languages](https://img.shields.io/badge/Languages-11-orange)](#learning-model)
[![Programmes](https://img.shields.io/badge/Programmes-15-blueviolet)](#learning-model)

AI Educademy is the production Next.js platform for [aieducademy.org](https://aieducademy.org). It combines public learning content, Pro lessons, multilingual routing, authentication, payments, progress tracking, certificates, AI chat, mock interviews, and the shared AI Educademy design system.

[Start learning](https://aieducademy.org) | [Blog](https://aieducademy.org/en/blog) | [Storybook](https://ai-educademy.github.io/ai-ui-library/) | [UI package](https://www.npmjs.com/package/@ai-educademy/ai-ui-library) | [Contributing](CONTRIBUTING.md)

</div>

## Product model

AI Educademy is a freemium learning product. The first lesson of every programme is free in every supported language. Full access to all programme lessons requires Pro:

| Plan | Price | Notes |
|------|-------|-------|
| Monthly | £3.99/month | Flexible access |
| Annual | £29.99/year | Best subscription value |
| Lifetime | £49.99 | One payment for ongoing access |

Subscriptions fund hosting, translation, course maintenance, and new lesson production without adverts or learner data resale.

## What this repo contains

- Next.js 16 App Router application for the public site
- React 19, strict TypeScript, Tailwind CSS 4, and `next-intl`
- Authentication with NextAuth, GitHub OAuth, and Google OAuth
- Stripe backed Pro access, pricing, and subscription checks
- Neon Postgres with Drizzle ORM for users, progress, subscriptions, campaigns, and email state
- MDX lesson and blog rendering from the public and private course repos
- Gemini backed AI chat and mock interview experiences
- Certificate PDF generation, Resend email flows, PWA support, and security hardening
- Shared components from `@ai-educademy/ai-ui-library`

## Learning model

Fifteen programmes are grouped into three tracks:

| Track | Programmes |
|-------|------------|
| Understanding AI | AI Seeds, AI Sprouts, AI Branches, AI Canopy, AI Forest |
| Craft and Engineering | AI Sketch, AI Chisel, AI Craft, AI Polish, AI Masterpiece |
| Career Ready | Interview Launchpad, Behavioural Mastery, Technical Interviews, AI and ML Interviews, Offer and Beyond |

The public `ai-courses` repo carries public lesson content and the blog. The private `ai-courses-pro` repo carries subscriber lessons. This app joins both content sources into the live product.

## Tech stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | App Router, routing, rendering, metadata, and API routes |
| React | 19 | UI runtime |
| TypeScript | 6 | Strict application typing |
| Tailwind CSS | 4 | Styling |
| next-intl | 4 | Localised routes and messages |
| NextAuth | 5 beta | Authentication |
| Drizzle ORM | 0.45 | Database access |
| Neon Postgres | 17 compatible | Serverless database |
| Stripe | 22 | Pro plans and billing |
| Gemini API | 0.24 | AI chat and interview feedback |
| Resend | 6 | Transactional email |
| Vitest | 5 | Unit and integration tests |
| Playwright | 1.58 | End-to-end tests |

## Local development

Requirements:

- Node.js 22 or newer
- npm, using the committed `package-lock.json`
- Access to the required environment variables in `.env.local`

```bash
git clone --recurse-submodules https://github.com/ai-educademy/ai-platform.git
cd ai-platform
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you cloned without submodules, run:

```bash
git submodule update --init --recursive
```

Useful checks:

```bash
npx tsc --noEmit
npx vitest run
npm run lint
npm run build
```

## Project structure

```text
ai-platform/
├── data/                         # Programme registry
├── messages/                     # Localised UI messages
├── public/                       # Static assets
├── scripts/                      # Build, migration, email, and content helpers
├── src/
│   ├── app/                      # App Router pages, layouts, APIs, sitemap, robots
│   ├── components/               # Product UI components
│   ├── hooks/                    # Client hooks
│   ├── i18n/                     # Locale and routing setup
│   ├── lib/                      # Content, pricing, Stripe, DB, email, auth, SEO helpers
│   └── types/                    # Shared TypeScript types
├── e2e/                          # Playwright tests
└── drizzle/                      # Database migrations
```

## Related repos

| Repo | Purpose |
|------|---------|
| [`ai-courses`](https://github.com/ai-educademy/ai-courses) | Public first lessons and blog content |
| `ai-courses-pro` | Private Pro lesson content |
| [`ai-ui-library`](https://github.com/ai-educademy/ai-ui-library) | Shared React component library and design tokens |
| [`ai-educademy/.github`](https://github.com/ai-educademy/.github) | Organisation profile and fleet automation docs |

## Contributing

Contributions are welcome when they improve learner outcomes. Please keep PRs focused, run the smallest relevant checks before raising them, and read [CONTRIBUTING.md](CONTRIBUTING.md) before making larger changes.

Good first contributions include typo fixes, accessibility improvements, content corrections, translation improvements, and small UI defects.

## Licence

The platform source code is MIT licensed. Course content and Pro material have their own content terms in their respective repositories.
