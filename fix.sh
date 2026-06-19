#!/bin/bash
set -e

APP_DIR="${1:-$HOME/wc2026}"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: App directory $APP_DIR not found."
  echo "Run setup.sh first: curl -sO https://raw.githubusercontent.com/vic-sv/testing/claude/optimistic-mccarthy-9l2rs9/setup.sh && bash setup.sh"
  exit 1
fi

cd "$APP_DIR"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "==> Working in $APP_DIR"
echo "==> Node: $(node --version), npm: $(npm --version)"

echo ""
echo "==> Installing tsx..."
npm install --save-dev tsx 2>/dev/null || true

echo ""
echo "==> Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "==> Building app..."
npm run build

echo ""
echo "======================================================"
echo " Build complete!"
echo ""
echo " App directory: $APP_DIR"
echo " Startup file:  server.js"
echo " Admin login:   admin@admin.com / admin123"
echo ""
echo " Next step: configure Node.js app in DirectAdmin panel"
echo "   - App root:    $APP_DIR"
echo "   - Startup file: server.js"
echo "   - Node version: 20"
echo "======================================================"
