#!/bin/sh
# Vercel install hook: init submodules if in a git repo, then npm ci
if git rev-parse --git-dir > /dev/null 2>&1; then
  git config --global url."https://x-access-token:${SUBMODULE_PAT}@github.com/".insteadOf "https://github.com/"
  git submodule update --init --force content
  git submodule update --init --force content-pro || echo "⚠️ content-pro not accessible — free content only"
fi
npm ci --legacy-peer-deps
