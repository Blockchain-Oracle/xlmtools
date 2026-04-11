# Stage 1: Build
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests and lockfile first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source and build only the API package
COPY packages/api/ ./packages/api/
RUN pnpm --filter @xlmtools/api build

# Prune dev dependencies before copying to production stage
RUN pnpm --filter @xlmtools/api --prod deploy /app/prod

# Stage 2: Production
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy pruned production deps and built output
COPY --from=builder /app/prod/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
