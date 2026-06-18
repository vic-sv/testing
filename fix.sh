#!/bin/bash
set -e

APP_DIR="${1:-$HOME/wc2026}"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: App directory $APP_DIR not found."
  echo "Run setup.sh first: curl -sO https://raw.githubusercontent.com/vic-sv/testing/claude/optimistic-mccarthy-9l2rs9/setup.sh && bash setup.sh"
  exit 1
fi

cd "$APP_DIR"

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "==> Working in $APP_DIR"
echo "==> Node: $(node --version), npm: $(npm --version)"

echo ""
echo "==> Installing tsx if needed..."
npm install --save-dev tsx 2>/dev/null || true

echo ""
echo "==> Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "==> Building app..."
npm run build

echo ""
echo "==> Installing PM2..."
npm install -g pm2 2>/dev/null || true

echo ""
echo "==> Starting app with PM2 on port 3000..."
pm2 delete wc2026 2>/dev/null || true
pm2 start npm --name wc2026 -- start
pm2 save

echo ""
echo "======================================================"
echo " App is running at http://$(hostname -I | awk '{print $1}'):3000"
echo " Admin login: admin@admin.com / admin123"
echo "======================================================"
