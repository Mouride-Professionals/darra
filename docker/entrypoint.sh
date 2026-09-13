#!/bin/sh
# =============================================================================
# entrypoint.sh — copies the built frontend into the shared "public-data"
# volume so the stock nginx container can serve it, then starts the API.
# =============================================================================
set -e

mkdir -p /tmp/public
cp -r /app/public/. /tmp/public/

exec node src/app.js
