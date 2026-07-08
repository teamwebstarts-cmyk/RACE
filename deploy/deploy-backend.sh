#!/bin/bash
#
# Deploy (or redeploy) the RACE backend on the VM.
# Run as the race user after gcp-vm-setup.sh has been executed.
#
# Usage:
#   cd ~/RACE && bash deploy/deploy-backend.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend"
PM2_APP_NAME="race-api"

if [[ ! -f "${BACKEND_DIR}/package.json" ]]; then
  echo "backend/package.json not found at ${BACKEND_DIR}" >&2
  exit 1
fi

if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  echo "Missing ${BACKEND_DIR}/.env — copy from .env.example and configure it first." >&2
  exit 1
fi

cd "$BACKEND_DIR"
mkdir -p logs

echo "Installing dependencies..."
npm ci

echo "Building TypeScript..."
npm run build

echo "Seeding catalog data (idempotent)..."
npm run seed

echo "Removing dev dependencies..."
npm prune --omit=dev

echo "Starting / restarting PM2 process..."
if pm2 describe "$PM2_APP_NAME" &>/dev/null; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  pm2 start "${SCRIPT_DIR}/ecosystem.config.cjs"
fi

pm2 save

echo ""
echo "Deploy complete. Check health:"
echo "  curl http://localhost/health"
echo "  pm2 logs ${PM2_APP_NAME}"
