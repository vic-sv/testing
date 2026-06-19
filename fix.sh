#!/bin/bash
set -e

APP_DIR="${1:-$HOME/wc2026}"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: App directory $APP_DIR not found."
  echo "Run setup.sh first."
  exit 1
fi

cd "$APP_DIR"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "==> Working in $APP_DIR"
echo "==> Node: $(node --version), npm: $(npm --version)"

echo ""
echo "==> Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "======================================================"
echo " Ready! Configure DirectAdmin Node.js app:"
echo "   App root:     $APP_DIR"
echo "   Startup file: server.js"
echo "   Node version: 18 or 20"
echo "   Admin login:  admin@admin.com / admin123"
echo "======================================================"
