#!/bin/bash

APP_DIR="${1:-$HOME/wc2026}"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: $APP_DIR not found. Run setup.sh first."
  exit 1
fi

echo "==> Downloading pre-seeded database..."
curl -sL "https://raw.githubusercontent.com/vic-sv/testing/claude/optimistic-mccarthy-9l2rs9/dev.db" -o "$APP_DIR/dev.db"

echo ""
echo "======================================================"
echo " Done! Database is ready."
echo " Now configure Node.js in DirectAdmin:"
echo "   App root:     $APP_DIR"
echo "   Startup file: server.js"
echo "   Node version: 18 or 20"
echo "   Admin login:  admin@admin.com / admin123"
echo "======================================================"
