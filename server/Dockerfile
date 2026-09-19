FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY server/package.json ./server/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile --filter @fala-pt/server...

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY . .
RUN pnpm --filter @fala-pt/server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/package.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/index.js"]
