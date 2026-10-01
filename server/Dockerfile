FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY packages/api/package.json ./packages/api/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile --filter @falatorio/server...

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/core ./packages/core
COPY packages/db ./packages/db
COPY server ./server
RUN pnpm --filter @falatorio/core build
RUN pnpm --filter @falatorio/db build
RUN pnpm --filter @falatorio/server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/packages/core/package.json ./packages/core/
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/package.json ./packages/db/
COPY --from=build /app/packages/db/drizzle ./packages/db/drizzle
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/

WORKDIR /app/server
EXPOSE 3001
CMD ["node", "dist/index.js"]
