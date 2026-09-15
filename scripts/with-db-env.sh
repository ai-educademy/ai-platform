#!/usr/bin/env bash
#
# Runs a command with DATABASE_URL loaded from the macOS Keychain.
#
# The connection string never goes into a file, a shell history entry or a chat
# message. It is read into the environment of one child process and nothing
# else. `.env.local` is deliberately not used: a production connection string
# sitting on disk is the thing most likely to end up in a backup, a screen share
# or a stray `git add -A`.
#
# Store it once, typed directly into your own terminal so it is never pasted
# anywhere it could be captured:
#
#   security add-generic-password -a "$USER" -s copilot/aieducademy-database-url -w
#
# That prompts for the value with no echo. Use -U on the same command to update.
#
# Then:
#
#   bash scripts/with-db-env.sh npm run db:migrate
#   bash scripts/with-db-env.sh npm run db:apply drizzle/0004_marketing_consent_and_campaigns.sql
#
set -euo pipefail

SERVICE="${DATABASE_URL_KEYCHAIN_SERVICE:-copilot/aieducademy-database-url}"

if [ "$#" -eq 0 ]; then
  echo "Usage: bash scripts/with-db-env.sh <command> [args...]" >&2
  exit 64
fi

if ! DATABASE_URL="$(security find-generic-password -s "$SERVICE" -w 2>/dev/null)"; then
  cat >&2 <<EOF
Could not read "$SERVICE" from the Keychain.

Store it first, typing the value at the prompt rather than passing it as an
argument, so it stays out of your shell history:

  security add-generic-password -a "\$USER" -s $SERVICE -w

EOF
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Keychain item \"$SERVICE\" is empty." >&2
  exit 1
fi

export DATABASE_URL
# Nothing is echoed about the value itself, not even its length.
echo "Loaded DATABASE_URL from Keychain item \"$SERVICE\"."

exec "$@"
