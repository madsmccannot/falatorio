FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY cms/package.json ./cms/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN pnpm install --frozen-lockfile --filter @fala-pt/cms...

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/cms/node_modules ./cms/node_modules
COPY packages/tsconfig ./packages/tsconfig
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
