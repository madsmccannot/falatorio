FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY cms/package.json ./cms/
RUN pnpm install --frozen-lockfile --filter @falatorio/cms...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/cms/node_modules ./cms/node_modules
COPY tsconfig.base.json ./
COPY cms ./cms
WORKDIR /app/cms
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/cms
COPY --from=builder /app/cms/dist ./dist
COPY --from=builder /app/cms/node_modules ./node_modules
COPY --from=builder /app/cms/package.json ./package.json
EXPOSE 3002
CMD ["node", "dist/server.js"]
