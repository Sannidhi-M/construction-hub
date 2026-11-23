#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu 24.04 VPS. Run as root:
#
#   curl -fsSL https://raw.githubusercontent.com/<you>/<repo>/main/deploy/server-setup.sh -o setup.sh
#   bash setup.sh
#
# (or copy the file over). Safe to run again. What it does:
#   - security updates installed automatically from now on
#   - Docker, git, rclone; 2 GB swap (builds need the headroom)
#   - firewall: only SSH, HTTP and HTTPS reachable from the internet
#   - a "deploy" user that owns the app, logging in with the same SSH key as root
#   - SSH: password logins and direct root login turned off — but only once
#     the deploy user has a key, so you can never lock yourself out
set -euo pipefail

[ "$(id -u)" = 0 ] || { echo "Run as root." >&2; exit 1; }
DEPLOY_USER=deploy
export DEBIAN_FRONTEND=noninteractive

echo "==> Packages and automatic security updates"
apt-get update -q
apt-get upgrade -yq
apt-get install -yq ca-certificates curl git ufw unattended-upgrades fail2ban rclone
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> Swap"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Firewall"
# Docker publishes only Caddy's 80/443 (docker-compose.yml); Postgres and
# Redis have no published ports, so they stay unreachable from outside.
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "==> Deploy user"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG docker,sudo "$DEPLOY_USER"
# Password-less sudo is not granted; set a password for sudo use:
#   passwd deploy
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
if [ -s /root/.ssh/authorized_keys ] && [ ! -s "/home/$DEPLOY_USER/.ssh/authorized_keys" ]; then
  install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" /var/backups/constructmitra

echo "==> SSH hardening"
if [ -s "/home/$DEPLOY_USER/.ssh/authorized_keys" ]; then
  cat > /etc/ssh/sshd_config.d/99-constructmitra.conf <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
CONF
  systemctl reload ssh
  echo "Done. BEFORE closing this session, check in a NEW terminal: ssh $DEPLOY_USER@<server-ip>"
else
  echo "SKIPPED: no SSH key found for root, so password login stays on." >&2
  echo "Add your public key to /home/$DEPLOY_USER/.ssh/authorized_keys and run this again." >&2
fi
