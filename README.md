# Falatório

A language learning app built exclusively for **European Portuguese (PT-PT)**. Mobile-first, designed for immigrants in Portugal — including Hindi, Bengali, and Urdu speakers since lately there has been an increasing number of immigranats from the locations where these languages are spoken. The learning path adapts based on the learner's native language (L1), with personalized phonetic guides, false friend warnings, and culturally relevant scenarios.

## Architecture

Turborepo monorepo with pnpm workspaces. TypeScript strict mode everywhere.

```
falatorio/
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
| Mobile | React Native 0.86, Expo SDK 57, expo-router, Reanimated 4.5, Gesture Handler |
| Server | Fastify 5, tRPC 11, superjson |
| Database | PostgreSQL (Neon), Drizzle ORM, 26 tables + 3 enums |
| Cache/Queue | Redis (ioredis), BullMQ (6 queues) |
| Auth | Clerk (JWT, cached in Redis) — optional, app runs in preview mode without it |
| CMS | Payload CMS v3, PostgreSQL adapter, R2 storage |
| Payments | RevenueCat (subscriptions), AdMob (GDPR-aware) |
| AI | LLM-powered conversation tutor, dynamic content generation, exercise generation; OpenAI Whisper (speech), Azure TTS |
| Storage | MMKV (device), Cloudflare R2 (audio, media) |
| CI/CD | GitHub Actions, Docker (GHCR), Railway, Vercel |
| i18n | Custom hook-based system, 8 languages (en, pt, es, fr, hi, ur, ar, bn) |

## Core Concepts

### L1 Profiles

Every source language is a separate product. Each L1 profile contains phonetic transfer maps, grammar interference patterns, false friends, and cultural bridges. 15 profiles: en, es, fr, de, hi, ur, ar, bn, zh, ru, uk, tr, pl, ko, ja.

Phase 1 languages (en, es, fr, hi, ur, ar, bn) have full production profiles: 15-40 false friends, 12-15 phonetic difficulties, 12-15 grammar gaps, 15-30 cognates, and 15-25 cultural references per language. Phase 2 languages (de, zh, ru, uk, tr, pl, ko, ja) have functional stubs.

### Skill / Knowledge / Mastery Model

The pedagogical layer sits on top of the course tree. Skills represent linguistic competencies (e.g. `PT.VERBS.PRESENT`, `PT.SYNTAX.SUBORDINATION.CAUSAL`), each decomposed into atomic KnowledgeItems. Every exercise is linked to one or more KnowledgeItems via the `exercise_knowledge` bridge table, so results flow into per-skill mastery scores rather than just per-exercise progress.

Mastery is calculated from 3 weighted signals: accuracy (recent performance, 50%), variety (exercise type diversity, 25%), and production ratio (harder output tasks vs recognition, 25%). Confidence factors in repetition count, variety, and recency. CEFR level is estimated per user by aggregating skill mastery across levels, with an explicit confidence percentage — never a binary label.

KnowledgeItems carry 7 cognitive levels (recognition, comprehension, controlled production, transformation, translation, free production, communication) that specify which exercise types are appropriate. They also declare inter-knowledge relations (related, confusable_with, reinforces) for exercise generation and error prediction, and per-L1 difficulty metadata for personalized prioritisation.

The mastery module (`packages/core/src/mastery/`) includes: QA validator (schema, graph integrity, linguistic completeness), prerequisite checker with topological sort, coverage metrics, exercise generation spec with alignment validation, adaptive engine types for the future selector, and a readiness checker that validates Definition of Done criteria and vertical slice completeness across 10 implementation phases. The taxonomy seed (192 Skills, 55 KnowledgeItems) has 7 complete vertical slices: PT.TENSES.PRESENT, PT.PREP.BASIC, PT.SYNTAX.DIRECT_OBJECT, PT.SYNTAX.SUB.CAUSAL, PT.SEM.ASPECT.HABITUAL, PT.DISCOURSE.COHESION.LEXICAL, PT.RHETORIC.METAPHOR.

The mastery logic is deterministic and auditable. AI does not drive the adaptive engine; it generates content for a structured exercise bank.

### Dynamic Content Generation

Exercises are not statically authored. L1 profiles provide seed knowledge (false friends, grammar gaps, phonetic difficulties, cognates, cultural references), and AI generates personalized exercises dynamically based on the user's L1, CEFR level, and demonstrated weaknesses. Generated exercises are stored in the database so they are not regenerated. The seed content service creates the course structure (courses, units, lessons) per L1, while exercises fill in dynamically on demand.

### FSRS (Free Spaced Repetition Scheduler)

Exercises are scheduled using the FSRS algorithm. The system tracks stability, difficulty, and optimal review intervals per exercise per user. FSRS also feeds into the mastery layer — review results produce skill evidence alongside spaced repetition state.

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

### Internationalization (i18n)

All user-facing strings are translatable via the `useTranslation()` hook (`apps/mobile/lib/i18n.ts`). The system reads the user's selected L1 from MMKV storage and resolves strings through a fallback chain: `L1 dictionary -> English -> raw key`. English is the source of truth; Portuguese (PT-PT) has full coverage with proper diacritics. Other supported languages (es, fr, hi, ur, ar, bn) have partial coverage and fall back to English for missing keys.

### Onboarding Gate

Fresh installs always land on the onboarding flow. The root `app/index.tsx` uses Expo Router's `<Redirect>` pattern to check MMKV for onboarding completion state and route accordingly. In preview mode (no Clerk key), this is the sole entry gate. In authenticated mode, Clerk's `isSignedIn` state drives navigation.

## Package Breakdown

### `packages/core` — 64 files

Pure business logic, zero dependencies on I/O or frameworks:

- **FSRS** — scheduler, rating, card state machine
- **Scoring** — text scorer, speech scorer, PT-EU phonetic rules
- **Lesson** — session state, adaptive exercise selector, placement test
- **Mastery** — evidence recorder, mastery calculator (accuracy/variety/production weights), CEFR estimator with confidence scores, QA validator, prerequisite checker, coverage metrics, exercise generation spec, adaptive engine types
- **Economy** — currency ops, earn/spend rules, shop catalog, IAP tiers
- **Entitlements** — feature gates, heart system, access checks
- **Gamification** — XP calculator, streak logic, league promotion, achievements
- **Ads** — ad policy (GDPR, tier, cooldowns)
- **L1 Profiles** — 15 language transfer profiles with cultural content (7 fully expanded)

### `packages/db` — 23 schema tables

Users, courses, units, lessons, exercises, audio clips, user progress, streaks, league entries, transactions, wallets, shop items, IAP receipts, conversation sessions, achievements, ad events, L1 cultural content, skills, knowledge items, skill prerequisites, exercise-knowledge bridge (with primary/secondary flag), skill evidence, skill mastery, knowledge relations (related/confusable/reinforces), lesson-skills bridge (curriculum mapping). Initial Drizzle migration generated.

### `server` — 12 routers, 7 services, 6 jobs

**Routers:** auth, user, lesson, progress, speech, conversation, gamification, content, economy, shop, hearts, ads.

**Services:** Whisper (transcription), Azure TTS, LLM (conversation tutor), content generator (dynamic lesson/exercise generation using L1 profiles), seed content (course structure seeding per L1), FCM push, R2 storage, IAP validation (Apple + Google), RevenueCat webhooks.

**Jobs (BullMQ):** exercise generation (uses content-generator service), league reset, streak reminders, quality flagging, heart refill, subscription checks.

### `apps/mobile` — 26 screens, 41 components, 8 hooks

**Root:** `index.tsx` redirect gate (onboarding vs tabs based on MMKV state).

**Onboarding:** language select, GDPR consent, goal, level, placement test, plan.

**Tabs:** learn (course tree), practice (FSRS review queue), league (leaderboard), shop, profile.

**Lesson flow:** exercise screen with 8 exercise types (translate, fill blank, listen & type, match pairs, pick correct, reorder words, speak & score), feedback overlay, result screen.

**Conversation:** scenario picker, chat with AI-powered PT-EU tutor with error extraction.

**Shop:** Super subscription detail, crystal/ouro packs (RevenueCat IAP).

**Components:** UI primitives (Button, Card, Modal, Toast, Loading), exercise renderers, lesson components (progress bar, heart indicator, feedback, PT-EU vs PT-BR toggle), audio (player, recorder, waveform), gamification (XP bar, streak badge, league card, achievement toast), paywall (out of hearts, mid-lesson, Super upsell, feature lock, ad-or-pay choice), shop (crystal balance, item card, IAP modal, chest offer, Super banner), ads (provider, banner, interstitial, reward), pronunciation (mouth diagram SVG, phoneme card with animation, L1-based pronunciation guide), SVG icon system (react-native-svg, no emojis).

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
pnpm --filter @falatorio/mobile dev

# Build preview APK
pnpm --filter @falatorio/mobile eas:build --profile preview

# Build production
pnpm --filter @falatorio/mobile eas:build --profile production
```

The mobile app runs without `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in preview mode: auth is skipped, navigation is gated by MMKV onboarding state, and all features work with mock/local data. Set the key to enable Clerk auth in production builds.

## CI/CD

Four GitHub Actions workflows:

- **ci.yml** — lint, typecheck, test (with Postgres + Redis services), build, DB migration check on PRs
- **deploy-server.yml** — Docker build to GHCR, deploy to Railway, run DB migrations
- **deploy-cms.yml** — Docker build to GHCR, deploy to Railway
- **deploy-web.yml** — Build and deploy to Vercel

## Visual Identity

- Currency: **ouro** — represented as 3 gold prisms of different sizes (small, large, medium), grouped together with golden tones, light, and shadow detail
- No emojis anywhere — all icons are SVG via react-native-svg for cross-platform consistency
- Portuguese visual identity throughout
- Reward animation: top-down camera, hands open a cord-tied sack to reveal shiny golden coins inside
- All UI strings translatable via `useTranslation()` hook — supports 8 languages with English fallback

## License

Private.
