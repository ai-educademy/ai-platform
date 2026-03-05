<div align="center">

# 🌐 AI Platform

**The main Next.js app shell for [Open AI School](https://open-ai-school.vercel.app)**

[![Live](https://img.shields.io/badge/Live-open--ai--school.vercel.app-6366f1)](https://open-ai-school.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The central application shell that powers Open AI School — handling routing, authentication, internationalization, and program discovery. Consumes the shared [`@open-ai-school/ai-ui-library`](https://www.npmjs.com/package/@open-ai-school/ai-ui-library) for all UI components.

</div>

---

## ✨ Features

- 🗂️ **Multi-program routing** — `/programs/ai-seeds/lessons/what-is-ai`
- 🔐 **Authentication** — GitHub OAuth via NextAuth.js + guest mode
- 🌍 **Internationalization** — 5 languages (EN, FR, NL, HI, TE) via next-intl
- 📝 **MDX lessons** — Rich content with frontmatter metadata
- 🎨 **Shared UI** — All components from `@open-ai-school/ai-ui-library`
- 🌙 **Dark/light mode** — System preference + manual toggle
- 📊 **Progress tracking** — Per-program, localStorage-based
- 🎮 **AI Playground** — Interactive drawing recogniser

## 🏗️ Architecture

```
ai-platform/
├── src/
│   ├── app/
│   │   ├── [locale]/          # i18n-aware routes
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── about/         # About page
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── playground/    # AI playground
│   │   │   ├── lessons/       # Legacy lesson routes
│   │   │   └── programs/      # Multi-program routes
│   │   │       └── [programSlug]/
│   │   │           └── lessons/[slug]/
│   │   ├── api/auth/          # NextAuth.js endpoints
│   │   └── globals.css        # Global styles + tokens
│   ├── components/
│   │   ├── auth/              # SignIn, UserMenu
│   │   ├── lessons/           # LessonRenderer, LessonComplete
│   │   ├── playground/        # DrawingRecogniser
│   │   └── ui/                # App-specific UI (Navbar, Footer)
│   ├── hooks/                 # useProgress, useGuestProfile
│   ├── i18n/                  # Locale config
│   ├── lib/                   # Data layer (programs, lessons)
│   └── middleware.ts          # i18n routing middleware
├── content/                   # MDX lessons + program registry
├── messages/                  # Translation files
└── public/                    # Static assets
```

## 🚀 Quick Start

```bash
git clone https://github.com/open-ai-school/ai-platform.git
cd ai-platform
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🌐 Deployment

Deployed automatically to [Vercel](https://vercel.com) on push to `main`.

**Live:** https://open-ai-school.vercel.app

## 📦 Related Repos

| Repo | Description |
|------|-------------|
| [`ai-ui-library`](https://github.com/open-ai-school/ai-ui-library) | 🎨 Shared design system ([npm](https://www.npmjs.com/package/@open-ai-school/ai-ui-library)) |
| [`ai-seeds`](https://github.com/open-ai-school/ai-seeds) | 🌱 Level 1: Absolute beginners |
| `ai-sprouts` | 🌿 Level 2: Foundations (coming soon) |
| `ai-branches` | 🌳 Level 3: Applied AI (coming soon) |
| `ai-canopy` | 🏕️ Level 4: Advanced (coming soon) |
| `ai-forest` | 🌲 Level 5: Expert (coming soon) |

## 📄 License

MIT © [Open AI School](https://github.com/open-ai-school)

