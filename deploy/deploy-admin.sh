#!/bin/bash
#
# Build and serve the RACE admin panel (static files via nginx on port 3001).
# Run as the race user after gcp-vm-setup.sh.
#
# Usage:
#   cd ~/RACE && bash deploy/deploy-admin.sh
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ADMIN_DIR="${REPO_ROOT}/race-admin"
ADMIN_WEB="${ADMIN_DIR}/apps/admin-web"
NGINX_SITE="/etc/nginx/sites-available/race-admin"

if [[ ! -f "${ADMIN_DIR}/package.json" ]]; then
  echo "race-admin/package.json not found at ${ADMIN_DIR}" >&2
  exit 1
fi

if [[ ! -f "${ADMIN_WEB}/.env" ]]; then
  echo "Creating ${ADMIN_WEB}/.env from .env.example"
  cp "${ADMIN_WEB}/.env.example" "${ADMIN_WEB}/.env"
  echo "Edit VITE_API_URL in ${ADMIN_WEB}/.env then re-run this script." >&2
  exit 1
fi

cd "$ADMIN_DIR"

echo "Installing admin dependencies..."
npm ci

echo "Building admin panel..."
npm run build

if [[ ! -d "${ADMIN_WEB}/dist" ]]; then
  echo "Build output not found at ${ADMIN_WEB}/dist" >&2
  exit 1
fi

echo "Configuring nginx for admin on port 3001..."
sudo tee "$NGINX_SITE" > /dev/null <<NGINX
server {
    listen 3001;
    listen [::]:3001;
    server_name _;

    root ${ADMIN_WEB}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/race-admin
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "Admin deploy complete."
echo "  Open: http://<VM_EXTERNAL_IP>:3001"
echo "  API should be: \$(grep VITE_API_URL ${ADMIN_WEB}/.env)"
