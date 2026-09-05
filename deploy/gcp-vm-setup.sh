#!/bin/bash
#
# RACE — Google Cloud VM bootstrap
#
# Provisions a fresh Debian/Ubuntu VM with the `race` user, Node.js 20, MongoDB,
# Redis, PM2, and nginx so you can deploy the backend API.
#
# Usage (on the VM, as root):
#   sudo bash gcp-vm-setup.sh [race_user] [ssh_deploy_user]
#
# Examples:
#   sudo bash gcp-vm-setup.sh
#   sudo bash gcp-vm-setup.sh race labham
#
# After this script finishes, switch to the race user and deploy:
#   sudo su - race
#   git clone <your-repo-url> ~/RACE
#   cd ~/RACE && bash deploy/deploy-backend.sh
#

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "$0 must be run as root (sudo)" >&2
  exit 1
fi

echo "Running as root — setting up RACE VM" >&2

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
RACE_USER="${1:-race}"
# GCP SSH login user (for SCP/git deploy from your laptop). Optional.
DEPLOY_USER="${2:-}"

APP_NAME="RACE"
APP_DIR="/home/${RACE_USER}/${APP_NAME}"
BACKEND_DIR="${APP_DIR}/backend"
NODE_MAJOR="20"
PM2_APP_NAME="race-api"

export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
user_exists() {
  id "$1" &>/dev/null
}

create_race_user() {
  if user_exists "$RACE_USER"; then
    echo "User ${RACE_USER} already exists — skipping creation."
    return
  fi

  adduser --disabled-password --gecos "" "$RACE_USER"
  usermod -aG sudo "$RACE_USER"

  SUDOERS_FILE="/etc/sudoers.d/${RACE_USER}"
  echo "${RACE_USER} ALL=(ALL) NOPASSWD:ALL" > "$SUDOERS_FILE"
  chmod 440 "$SUDOERS_FILE"

  echo "User ${RACE_USER} created with passwordless sudo."
}

prepare_app_directory() {
  mkdir -p "$APP_DIR"
  mkdir -p "${APP_DIR}/deploy"
  chown -R "${RACE_USER}:${RACE_USER}" "/home/${RACE_USER}"
  chmod 755 "/home/${RACE_USER}"
  echo "App directory ready at ${APP_DIR}"
}

allow_deploy_user_home_access() {
  if [[ -z "$DEPLOY_USER" ]]; then
    return
  fi

  if ! user_exists "$DEPLOY_USER"; then
    echo "Deploy user ${DEPLOY_USER} not found — skipping home permission tweak."
    return
  fi

  DEPLOY_HOME="/home/${DEPLOY_USER}"
  if [[ -d "$DEPLOY_HOME" ]]; then
    chmod o+rx "$DEPLOY_HOME"
    echo "Granted other-read on ${DEPLOY_HOME} for bundle uploads."
  fi
}

install_system_packages() {
  apt-get update
  apt-get install -y \
    ca-certificates \
    curl \
    git \
    gnupg \
    build-essential \
    redis-server \
    nginx \
    acl
}

install_nodejs() {
  if command -v node &>/dev/null && node -v | grep -q "v${NODE_MAJOR}"; then
    echo "Node.js ${NODE_MAJOR} already installed: $(node -v)"
    return
  fi

  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" -o /tmp/nodesource_setup.sh
  bash /tmp/nodesource_setup.sh
  apt-get install -y nodejs
  rm -f /tmp/nodesource_setup.sh

  echo "Node.js installed: $(node -v), npm $(npm -v)"
}

configure_redis() {
  # Bind to localhost only; backend uses redis://localhost:6379
  sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
  sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf || true
  sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf || true

  systemctl enable redis-server
  systemctl restart redis-server
  echo "Redis running on 127.0.0.1:6379"
}

install_mongodb() {
  if command -v mongod &>/dev/null; then
    echo "MongoDB already installed: $(mongod --version | head -1)"
    systemctl enable mongod
    systemctl restart mongod
    return
  fi

  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
    | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

  # Debian 12/13: use MongoDB's bookworm repo
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list

  apt-get update
  apt-get install -y mongodb-org

  systemctl enable mongod
  systemctl restart mongod

  echo "MongoDB running on 127.0.0.1:27017"
  if command -v mongosh &>/dev/null; then
    echo "mongosh installed: $(mongosh --version)"
  fi
}

install_pm2() {
  npm install -g pm2 typescript
  echo "PM2 installed: $(pm2 -v)"
}

configure_nginx() {
  cat > /etc/nginx/sites-available/race-api <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX

  ln -sf /etc/nginx/sites-available/race-api /etc/nginx/sites-enabled/race-api
  rm -f /etc/nginx/sites-enabled/default

  nginx -t
  systemctl enable nginx
  systemctl restart nginx
  echo "nginx reverse proxy listening on port 80 → localhost:3000"
}

configure_pm2_startup() {
  # PM2 must register its systemd unit as the race user
  sudo -u "$RACE_USER" env PATH="$PATH" pm2 startup systemd -u "$RACE_USER" --hp "/home/${RACE_USER}" | tail -1 | bash || true
}

print_next_steps() {
  cat <<EOF

================================================================================
RACE VM setup complete
================================================================================

1. Open GCP firewall (VPC → Firewall) or instance tag rule:
   - Allow TCP 80  (HTTP via nginx)
   - Allow TCP 443 (HTTPS, after you add TLS)
   - Optional: TCP 22 for SSH

2. MongoDB runs locally — use in .env:
   MONGODB_URI=mongodb://127.0.0.1:27017/race-service

3. Deploy the backend as user '${RACE_USER}':

   sudo su - ${RACE_USER}
   git clone <your-repo-url> ~/RACE
   cd ~/RACE/backend
   cp .env.example .env
   # Edit .env — set MONGODB_URI, JWT secrets, APP_BASE_URL, CORS_ORIGIN, NODE_ENV=production
   nano .env

   cd ~/RACE
   bash deploy/deploy-backend.sh

4. Verify:
   curl http://localhost/health
   curl http://<VM_EXTERNAL_IP>/health

5. PM2 commands (as ${RACE_USER}):
   pm2 status
   pm2 logs ${PM2_APP_NAME}
   pm2 restart ${PM2_APP_NAME}

App directory : ${APP_DIR}
Backend       : ${BACKEND_DIR}
MongoDB       : mongodb://127.0.0.1:27017/race-service
Redis         : redis://localhost:6379
API (internal): http://127.0.0.1:3000
API (public)  : http://<VM_EXTERNAL_IP>/

================================================================================
EOF
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
create_race_user
prepare_app_directory
allow_deploy_user_home_access
install_system_packages
install_nodejs
configure_redis
install_mongodb
install_pm2
configure_nginx
configure_pm2_startup
print_next_steps

echo "User setup, permissions, and installations completed."
