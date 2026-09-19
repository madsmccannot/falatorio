# Fala PT

A language learning app built exclusively for **European Portuguese (PT-EU)**. Mobile-first, with L1-customized experiences per source language — the learning path adapts based on where the learner is coming from.

## Architecture

Turborepo monorepo with pnpm workspaces. TypeScript strict mode everywhere.

```
falapt/
├── apps/
│   ├── mobile/          React Native + Expo (expo-router)
│   └── web/             Next.js (deprioritized)
├── packages/
│   ├── core/            Pure business logic (zero I/O)
│   ├── db/              Drizzle ORM + Neon PostgreSQL
│   ├── ui/              Shared design tokens
│   └── api/             Shared API types
├── server/              Fastify + tRPC
└── cms/                 Payload CMS v3
```

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.76, Expo 52, expo-router, Reanimated, Gesture Handler |
| Server | Fastify 5, tRPC 11, superjson |
| Database | PostgreSQL (Neon), Drizzle ORM, 18 schema tables |
| Cache/Queue | Redis (ioredis), BullMQ (6 queues) |
| Auth | Clerk (JWT, cached in Redis) |
| CMS | Payload CMS v3, PostgreSQL adapter, R2 storage |
| Payments | RevenueCat (subscriptions), AdMob (GDPR-aware) |
| AI | Claude (conversation tutor, exercise generation), OpenAI Whisper (speech), Azure TTS |
| Storage | Cloudflare R2 (audio, media) |
| CI/CD | GitHub Actions, Docker (GHCR), Railway, Vercel |

## Core Concepts

### L1 Profiles

Every source language is a separate product. Each L1 profile contains phonetic transfer maps, grammar interference patterns, false friends, and cultural bridges. Currently 15 profiles: en, es, fr, de, it, nl, pl, ro, uk, ru, ar, hi, bn, ur, zh.

### FSRS (Free Spaced Repetition Scheduler)

Exercises are scheduled using the FSRS algorithm. The system tracks stability, difficulty, and optimal review intervals per exercise per user.

### Economy

Currency is **ouro** (ledger-based — balance = SUM of transactions, never stored as a field). Earned through lessons, ads, and achievements. Spent on hearts, shop items, streak freezes.

### Heart System

Free users get 5 hearts, refilling 1 every 4 hours. Running out mid-lesson triggers a paywall (50 ouro to continue). Super subscribers get unlimited hearts.

### Tiers

| | Free | Super |
|---|---|---|
| Hearts | 5 (refill every 4h) | Unlimited |
| Ads | Banner + interstitial + reward | None |
| Error review | 3/day | Unlimited |
| Streak freeze | Purchasable | 1 free/month |

### Scoring

Text scoring uses Levenshtein distance with PT-EU phonetic normalization. Speech scoring uses Whisper transcription + text scoring pipeline.

## Package Breakdown

### `packages/core` — 63 files

Pure business logic, zero dependencies on I/O or frameworks:

- **FSRS** — scheduler, rating, card state machine
- **Scoring** — text scorer, speech scorer, PT-EU phonetic rules
- **Lesson** — session state, adaptive exercise selector, placement test
- **Economy** — currency ops, earn/spend rules, shop catalog, IAP tiers
- **Entitlements** — feature gates, heart system, access checks
- **Gamification** — XP calculator, streak logic, league promotion, achievements
- **Ads** — ad policy (GDPR, tier, cooldowns)
- **L1 Profiles** — 15 language transfer profiles with cultural content

### `packages/db` — 18 schema tables

Users, courses, units, lessons, exercises, audio clips, user progress, streaks, league entries, transactions, wallets, shop items, IAP receipts, conversation sessions, achievements, ad events, L1 cultural content.

### `server` — 12 routers, 7 services, 6 jobs

**Routers:** auth, user, lesson, progress, speech, conversation, gamification, content, economy, shop, hearts, ads.

**Services:** Whisper (transcription), Azure TTS, Claude LLM (conversation tutor), FCM push, R2 storage, IAP validation (Apple + Google), RevenueCat webhooks.

**Jobs (BullMQ):** exercise generation, league reset, streak reminders, quality flagging, heart refill, subscription checks.

### `apps/mobile` — 19 screens, 39 components, 8 hooks

**Onboarding:** language select, GDPR consent, goal, level, placement test, plan.

**Tabs:** learn (course tree), practice (FSRS review queue), league (leaderboard), shop, profile.

**Lesson flow:** exercise screen with 8 exercise types (translate, fill blank, listen & type, match pairs, pick correct, reorder words, speak & score), feedback overlay, result screen.

**Conversation:** scenario picker, chat with Claude-powered PT-EU tutor with error extraction.

**Components:** UI primitives (Button, Card, Modal, Toast, Loading), exercise renderers, lesson components (progress bar, heart indicator, feedback, PT-EU vs PT-BR toggle), audio (player, recorder, waveform), gamification (XP bar, streak badge, league card, achievement toast), paywall (out of hearts, mid-lesson, Super upsell, feature lock, ad-or-pay choice), shop (crystal balance, item card, IAP modal, chest offer, Super banner), ads (provider, banner, interstitial, reward).

### `cms` — 8 collections

Courses, Units, Lessons, Exercises (with drafts/review/live workflow), Vocabulary, Audio Clips (with R2 upload), L1 Cultural Content, Review Queue. Hooks auto-publish and auto-reject exercises through the review pipeline.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm 9.12+
- PostgreSQL (or Neon account)
- Redis

### Setup

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local

# Push database schema
pnpm db:push

# Start all services in dev mode
pnpm dev
```

### Environment Variables

```
DATABASE_URL=           # Neon PostgreSQL connection string
REDIS_URL=              # Redis connection string
CLERK_SECRET_KEY=       # Clerk auth
CLERK_PUBLISHABLE_KEY=
OPENAI_API_KEY=         # Whisper transcription
ANTHROPIC_API_KEY=      # Claude conversation tutor
AZURE_TTS_KEY=          # Azure Neural TTS
AZURE_TTS_REGION=
R2_ENDPOINT=            # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
REVENUECAT_API_KEY=     # RevenueCat
REVENUECAT_WEBHOOK_SECRET=
FCM_PROJECT_ID=         # Firebase push notifications
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=
PAYLOAD_SECRET=         # Payload CMS
```

### Mobile Development

```bash
# Start Expo dev server
pnpm --filter @fala-pt/mobile dev

# Build preview APK
pnpm --filter @fala-pt/mobile eas:build --profile preview

# Build production
pnpm --filter @fala-pt/mobile eas:build --profile production
```

## CI/CD

Four GitHub Actions workflows:

- **ci.yml** — lint, typecheck, test (with Postgres + Redis services), build, DB migration check on PRs
- **deploy-server.yml** — Docker build to GHCR, deploy to Railway, run DB migrations
- **deploy-cms.yml** — Docker build to GHCR, deploy to Railway
- **deploy-web.yml** — Build and deploy to Vercel

## Visual Identity

- Currency: **ouro** — represented as 3 gold prisms of different sizes (small, large, medium), grouped together with golden tones, light, and shadow detail
- No emojis anywhere — all visual elements are programmatic for cross-platform consistency
- Portuguese visual identity throughout
- Reward animation: top-down camera, hands open a cord-tied sack to reveal shiny golden coins inside

## License

Private.
