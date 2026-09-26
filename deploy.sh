#!/usr/bin/env bash
# Build Nodera and publish the static output to the nginx web root.
#
# One-time setup on the server:
#   sudo mkdir -p /opt/nodera /var/www/nodera
#   sudo chown -R "$USER":"$USER" /opt/nodera /var/www/nodera
#
# Usage: bash deploy.sh          (defaults below)
#        WEB_ROOT=/srv/x bash deploy.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/nodera}"
BRANCH="${BRANCH:-main}"

cd "$REPO_DIR"

echo "==> Fetching origin/$BRANCH"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm build

echo "==> Publishing to $WEB_ROOT"
mkdir -p "$WEB_ROOT"
rsync -a --delete dist/ "$WEB_ROOT/"

echo "✅ Deployed $(git rev-parse --short HEAD) to $WEB_ROOT"
