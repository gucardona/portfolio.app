#!/bin/bash
set -e

APP_NAME="portfolio"
BINARY="portfolio-app"
MAIN="./cmd/portfolio-app"

echo "→ Building React frontend..."
npm run build

echo "→ Building Go server..."
go build -o "$BINARY" "$MAIN"

echo "→ Restarting service..."
sudo systemctl restart "$APP_NAME"

echo "→ Done. Status:"
sudo systemctl status "$APP_NAME" --no-pager -l
