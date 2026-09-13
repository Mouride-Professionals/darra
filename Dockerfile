# =============================================================================
# Production Dockerfile — Daara Touba (Express API + React/Vite SPA)
# Single image: ships the backend and the built frontend together.
# nginx (stock image, see docker-compose.yml) reads the built frontend from a
# shared volume populated by docker/entrypoint.sh at container start.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build frontend (React + Vite)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Install backend dependencies (production only)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS backend-deps

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# -----------------------------------------------------------------------------
# Stage 3: Production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ .

# Built frontend — copied out to a shared volume at boot (see entrypoint.sh),
# not served directly from here.
COPY --from=frontend-builder /app/frontend/dist ./public

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Runs as root: entrypoint.sh writes into the "public-data" volume, which
# Docker creates owned by root regardless of image user — matches the
# africadex Dockerfile this was modeled on, which does the same for the
# same reason.
EXPOSE 5001

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5001/api/health || exit 1

CMD ["/entrypoint.sh"]
