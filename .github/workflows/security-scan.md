---
emoji: "🔐"
name: Security Scan
description: Hunts vulnerabilities, leaked secrets and unsafe patterns, and fixes the mechanical ones.
on:
  schedule:
    - cron: "weekly on wednesday"
  workflow_dispatch:
max-daily-ai-credits: 6000
permissions:
  contents: read
  pull-requests: read
  issues: read
  security-events: read
  vulnerability-alerts: read
engine:
  id: gemini
  model: gemini-3.8-flash
timeout-minutes: 25
strict: true
network:
  allowed: [defaults, node]
tools:
  cli-proxy: true
  edit:
  cache-memory: true
  bash: ["git *", "npm ci", "npm audit *", "npm run *", "npx tsc *", "npx vitest *", "cat", "ls", "grep", "head"]
  github:
    mode: gh-proxy
    toolsets: [repos, issues, pull_requests, code_security, secret_protection, dependabot]
safe-outputs:
  create-pull-request:
  create-issue:
    labels: [security]
    close-older-issues: true
---

# Security Scan

This is a public repository holding a product that takes payments and stores
user accounts. Treat it accordingly.

## Look for

**Leaked credentials.** Any API key, token, connection string, private key or
password committed to the repository, including in history, tests, fixtures,
MDX content, and `.env.example`. This is the single highest-severity thing you
can find. If you find one, open an issue immediately stating what was leaked
and where, **never quoting the value itself**, and say plainly that it must be
rotated, because a committed secret is burnt whether or not the commit is
reverted.

**Dependency vulnerabilities.** `npm audit` and open Dependabot alerts. Judge
real exploitability: a high severity in a build-only dev dependency is not the
same as one in a runtime path reachable from the internet. Say which it is.

**Unsafe patterns.** SQL built by string concatenation, `dangerouslySetInnerHTML`
with user input, unvalidated redirects, missing authorisation on API routes,
user input reaching the filesystem or a shell, secrets logged, stack traces
returned to clients, missing rate limits on anything expensive or writable.

**Authorisation.** Every API route that reads or writes user data must prove
who is calling and that they are allowed. Pay particular attention to any
route deciding free versus Pro access.

**CI/CD.** Credentials written to the filesystem in a workflow, `pull_request_target`
combined with checking out untrusted code, over-broad `permissions`, unpinned
third-party actions.

## Fix or report

Open a pull request only for mechanical, low-risk fixes: a patch-level
dependency bump, adding a missing authorisation check, removing a logged
secret, tightening workflow permissions. Add a test where a test is possible.

Open an issue for anything else, and always for anything touching payments,
authentication or a leaked credential. Rank by exploitability, not by scanner
severity. State your confidence honestly and never claim an exploit you did
not demonstrate.

Never commit a secret, never echo a secret value into logs, an issue or a pull
request body, and never weaken a check to make a scanner quiet.
