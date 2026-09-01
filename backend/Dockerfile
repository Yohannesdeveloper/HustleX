# ─────────────────────────────────────────────
# Stage 1: Install ALL dependencies (for build)
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install native build tools (needed by some npm packages)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --include=dev && npm cache clean --force

# ─────────────────────────────────────────────
# Stage 2: Production dependencies only
# ─────────────────────────────────────────────
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ─────────────────────────────────────────────
# Stage 3: Final production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install runtime-only OS deps
RUN apk add --no-cache dumb-init curl

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S hustlex -u 1001 -G nodejs

# Copy production node_modules from stage 2
COPY --from=prod-deps --chown=hustlex:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=hustlex:nodejs . .

# Create required directories with correct ownership
RUN mkdir -p logs uploads && \
    chown -R hustlex:nodejs logs uploads

# Drop to non-root
USER hustlex

# Environment
ENV NODE_ENV=production
ENV PORT=5000
# Reserve 1.5 GB for V8 heap — leaves headroom within a 2 GB container limit
ENV NODE_OPTIONS="--max-old-space-size=1536"

EXPOSE 5000

# Health check — hits the lightweight /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD curl -fs http://localhost:5000/api/health | grep -q '"status"' || exit 1

# Use dumb-init as PID 1 for proper signal handling (SIGTERM → graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
