# 🤝 Contributing to Open AI School

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents

- [Development Setup](#-development-setup)
- [Adding a New Language](#-adding-a-new-language)
- [Writing a New Lesson](#-writing-a-new-lesson)
- [Adding a New Program](#-adding-a-new-program)
- [Code Style Guide](#-code-style-guide)
- [Pull Request Process](#-pull-request-process)

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Git** with submodule support

### Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork with submodules
git clone --recurse-submodules https://github.com/YOUR_USERNAME/ai-platform.git
cd ai-platform

# 3. Add upstream remote
git remote add upstream https://github.com/open-ai-school/ai-platform.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env.local

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## 🌍 Adding a New Language

We use [next-intl](https://next-intl.dev/) for internationalization.

### Step 1: Add UI translations

Create a new translation file in `/messages/`:

```bash
cp messages/en.json messages/es.json  # Example: Spanish
```

Translate all string values (keep the keys in English).

### Step 2: Add lesson translations

In each content repo (e.g., `content/programs/ai-seeds/`):

```bash
mkdir -p content/programs/ai-seeds/lessons/es
```

Create translated MDX lesson files matching the English filenames.

### Step 3: Register the locale

Update the locale configuration in `src/i18n/` to include your new language code.

### Step 4: Submit your PR

Open a PR with the title: `feat(i18n): add Spanish translations`

---

## 📝 Writing a New Lesson

Lessons are written in [MDX](https://mdxjs.com/) format with YAML frontmatter.

### Frontmatter Schema

```yaml
---
title: "Your Lesson Title"
description: "A brief description of what the learner will learn"
order: 3
duration: "15 min"
difficulty: "beginner"    # beginner | intermediate | advanced
tags: ["ai", "neural-networks"]
---
```

### Lesson Content Guidelines

- **Keep it simple** — explain concepts as if teaching a friend
- **Use examples** — real-world analogies make concepts stick
- **Add visuals** — illustrations, diagrams, or code samples
- **Be inclusive** — avoid jargon without explanation
- **Keep lessons focused** — one concept per lesson, 5-15 minutes reading time

### File Location

```
content/programs/{program-slug}/lessons/{locale}/{order}-{slug}.mdx
```

Example: `content/programs/ai-seeds/lessons/en/03-types-of-ai.mdx`

---

## ➕ Adding a New Program

1. **Create the content repo** under the `open-ai-school` org
2. **Set up the lesson structure:**
   ```
   your-program/
   ├── lessons/
   │   └── en/
   │       └── 01-first-lesson.mdx
   └── program.json
   ```
3. **Register in `content/programs.json`:**
   ```json
   {
     "slug": "your-program",
     "level": 1,
     "status": "active",
     "color": "#34D399",
     "emoji": "🌱",
     "track": "ai-learning"
   }
   ```
4. **Add as a git submodule:**
   ```bash
   git submodule add https://github.com/open-ai-school/your-program.git content/programs/your-program
   ```

---

## 🎨 Code Style Guide

### General

- **TypeScript** in strict mode — no `any` types
- **Functional components** with hooks only
- **CSS** via Tailwind CSS utility classes

### Linting & Formatting

```bash
# Run the linter
npm run lint
```

We use ESLint with the Next.js recommended config. Fix all lint errors before submitting.

### File Naming

- Components: `PascalCase.tsx` (e.g., `LessonRenderer.tsx`)
- Utilities: `camelCase.ts` (e.g., `getPrograms.ts`)
- Lessons: `{order}-{slug}.mdx` (e.g., `01-what-is-ai.mdx`)
- Translations: `{locale}.json` (e.g., `en.json`)

---

## 🔄 Pull Request Process

### Before You Start

1. Check [existing issues](https://github.com/open-ai-school/ai-platform/issues) to avoid duplicate work
2. For large changes, open an issue first to discuss the approach
3. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

### PR Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] New features include appropriate tests
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format

### Commit Message Format

```
feat(scope): add new feature
fix(scope): fix a bug
docs(scope): update documentation
chore(scope): maintenance task
```

### Review Process

1. Submit your PR against the `main` branch
2. Fill out the PR template
3. A maintainer will review within 48 hours
4. Address any feedback
5. Once approved, a maintainer will merge

---

## 💬 Questions?

- Open a [GitHub Discussion](https://github.com/orgs/open-ai-school/discussions)
- Check existing issues for answers

Thank you for helping make AI education accessible to everyone! 🌍
