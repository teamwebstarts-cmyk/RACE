#!/bin/bash
# Optional: open port 3001 in ufw if you use it (GCP firewall is separate).
set -euo pipefail
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
  sudo ufw allow 3001/tcp
  echo "ufw: allowed TCP 3001"
else
  echo "ufw not active — open TCP 3001 in GCP VPC Firewall instead."
fi
