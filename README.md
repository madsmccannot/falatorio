# Falatorio

A language learning app built exclusively for **European Portuguese (PT-PT)**. Mobile-first, designed for immigrants in Portugal -- Hindi, Bengali, and Urdu speakers are the primary audience, reflecting the growing immigrant population from South Asia. The learning path adapts based on the learner's native language (L1), with personalized phonetic guides, animated pronunciation diagrams, false friend warnings, and culturally relevant scenarios.

## Architecture

Turborepo monorepo with pnpm workspaces. TypeScript strict mode everywhere.

```
falatorio/
├── apps/
│   ├── mobile/          React Native + Expo SDK 57 (expo-router)
│   └── web/             Next.js (deprioritized)
├── packages/
│   ├── core/            Pure business logic (zero I/O)
│   ├── db/              Drizzle ORM + Neon PostgreSQL
│   ├── ui/              Shared design tokens
│   └── api/             Shared API types
├── server/              Fastify + tRPC
├── cms/                 Payload CMS v3
├── scripts/             Utility scripts
├── Dockerfile           Multi-stage server build
├── docker-compose.yml   Local PostgreSQL + Redis
└── railway.json         Railway deployment config
```

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.86, Expo SDK 57, expo-router, expo-audio, Reanimated 4.5, Gesture Handler |
| Server | Fastify 5, tRPC 11, superjson |
| Database | PostgreSQL (Neon serverless), Drizzle ORM, 29 tables + 20 enums |
| Cache/Queue | Redis (Upstash), ioredis, BullMQ (7 job queues) |
| Auth | Clerk (JWT) -- optional, app runs in preview mode without it |
| CMS | Payload CMS v3, PostgreSQL adapter, R2 storage |
| Payments | RevenueCat (subscriptions) |
| AI | Claude (conversation tutor, dynamic content generation), OpenAI Whisper (speech), Azure TTS |
| Storage | MMKV (device), Cloudflare R2 (audio, media) |
| Deploy | Docker, Railway (server), EAS Build (mobile APK/AAB) |
| Analytics | PostHog (analytics, A/B testing, feature flags), custom batched event queue |
| i18n | Custom hook-based system, 16 dictionaries (en, pt, es, fr, hi, ur, ar, bn, de, zh, ru, uk, tr, pl, ko, ja) |

## Core Concepts

### L1 Profiles

Every source language is a separate product. Each L1 profile contains phonetic transfer maps, grammar interference patterns, false friends, cognates, and cultural bridges. 15 L1 profiles: en, es, fr, de, hi, ur, ar, bn, zh, ru, uk, tr, pl, ko, ja.

All 15 profiles are fully expanded with 40 false friends, 15 phonetic difficulties (with animated mouth position diagrams), 15 grammar gaps, 16-30 cognates, and cultural references.

### Skill / Knowledge / Mastery Model

Skills represent linguistic competencies (e.g. `PT.VERBS.PRESENT`, `PT.SYNTAX.SUBORDINATION.CAUSAL`), each decomposed into atomic KnowledgeItems. Every exercise is linked to one or more KnowledgeItems via the `exercise_knowledge` bridge table, so results flow into per-skill mastery scores.

Mastery is calculated from 3 weighted signals: accuracy (50%), variety (25%), and production ratio (25%). CEFR level is estimated per user by aggregating skill mastery across levels, with a confidence percentage -- never a binary label.

KnowledgeItems carry 7 cognitive levels (recognition, comprehension, controlled production, transformation, translation, free production, communication) and declare inter-knowledge relations (related, confusable_with, reinforces) for exercise generation and error prediction.

The taxonomy seed contains 272 Skills and 310 KnowledgeItems across 10 domain groups (phonetics, morphology, tenses_moods, determiners, pronouns, prepositions, syntax, lexicon, pragmatics, orthography).

### Content Hierarchy

```
Course  (1 per L1 language)
  └── Section  (1-4 numbered + Daily Refresh)
        └── Unit  (variable per section)
              └── Node  (lesson or chest)
                    └── Exercise  (dynamically generated)
```

| Section | CEFR | Units | Slots/Unit | Pattern |
|---------|------|-------|-----------|---------|
| S1 Basico | A1-A2 | 10 | 5-6 | Survival basics |
| S2 Principiante | A2-B1 | 30 | 6-7 | Daily life in Portugal |
| S3 Intermedio | B2-C1 | 40 | 6-8 | Conversation, work, culture |
| S4 Avancado | C1-C2 | 50 | 7-9 | Nuance, register, mastery |

Total: 130 units, ~930 slots (lessons + chests). Chest rewards cycle through ouro, XP boosts, streak freezes, and occasional Super days.

**Section Skip Test:** Each section has a "SALTAR PARA AQUI" button that launches a placement test filtered by the section's CEFR range. Passing (80%+ accuracy) marks all lessons in that section as completed.

### Daily Refresh

A parallel review layer that picks the optimal exercise mix based on user state. Scores candidates from 3 sources: FSRS-due items (45%), low-mastery skills (30%), and recent errors (25%). Session size adjusts by time of day (morning: 10, default: 15). 4-hour Redis cooldown between sessions. 0.5x XP multiplier.

### Daily Quests

3 adaptive quests generated daily based on user behaviour over the past 7 days. Quest types: complete_lesson, earn_xp, practice_speaking, review_items, maintain_streak, learn_minutes, perfect_lesson, practice_mistakes. Points accumulate toward a monthly goal matching the number of days in the current month.

### Dynamic Content Generation

Exercises are not statically authored. L1 profiles provide seed knowledge, and AI generates personalized exercises dynamically based on L1, CEFR level, and demonstrated weaknesses. Generated exercises are stored in the database so they are not regenerated.

### FSRS (Free Spaced Repetition Scheduler)

Exercises are scheduled using FSRS. The system tracks stability, difficulty, and optimal review intervals per exercise per user. Review results produce skill evidence alongside spaced repetition state.

### Economy

Currency is **ouro** (ledger-based -- balance = SUM of transactions). Earned through lessons, ads, and achievements. Spent on hearts, shop items, streak freezes. New users start with 500 ouro.

### Heart System

Free users start with 5 hearts, refilling 1 every 4 hours. Running out mid-lesson triggers a paywall (50 ouro to continue). Super subscribers get unlimited hearts.

### Tiers

| | Free | Super |
|---|---|---|
| Hearts | 5 (refill every 4h) | Unlimited |
| Ads | Banner + interstitial + reward | None |
| Error review | 3/day | Unlimited |
| Streak freeze | Purchasable | 1 free/month |
| Starting ouro | 500 | 500 |

### Social & Leagues

Users can follow/unfollow each other. 7 league tiers: Bronze, Silver, Gold, Sapphire, Ruby, Emerald, Diamond. Weekly leaderboard resets with promotion/demotion.

### Practice Tab

Four practice modes:

- **Smart Review** -- random exercises from completed content at 0.5x XP
- **Pronunciation** -- L1-specific phonetic difficulty guide with animated mouth/tongue diagrams
- **Conversation** -- AI-powered scenario-based chat with pronunciation feedback (8 scenarios gated by CEFR)
- **Common Mistakes** -- accumulated errors at 0.5x XP (3 sessions/day free, unlimited Super)

### Pronunciation Animations

14 mouth positions (rest, nasal_ao, nasal_vowel, palatal_lateral, palatal_nasal, uvular_r, alveolar_tap, open_e, closed_e, open_o, closed_o, sibilant_s, sibilant_sh, labiodental_v). The `AnimatedMouthDiagram` component renders animated cross-section SVGs of the oral cavity using react-native-reanimated.

### Scoring

Text scoring uses Levenshtein distance with PT-EU phonetic normalization. Speech scoring uses Whisper transcription + text scoring pipeline.

### Internationalization

All UI strings translatable via `useTranslation()` hook. 16 dictionaries (15 L1 languages + Portuguese) with full key parity. English is the source of truth; Portuguese has full coverage with proper diacritics. Placement test and section test questions are fully translated in all 15 languages.

## Package Breakdown

### `packages/core` -- 79 files

Pure business logic, zero I/O dependencies:

- **FSRS** -- scheduler, rating, card state machine
- **Scoring** -- text scorer, speech scorer, PT-EU phonetic rules
- **Lesson** -- session state, adaptive exercise selector, placement test
- **Mastery** -- evidence recorder, mastery calculator, CEFR estimator with confidence, QA validator, prerequisite checker, coverage metrics, exercise generation spec
- **Economy** -- currency ops, earn/spend rules, shop catalog, IAP tiers
- **Entitlements** -- feature gates, heart system, access checks
- **Gamification** -- XP calculator, streak logic, league promotion, 42 achievements (19 competence badges tied to mastery evidence)
- **Ads** -- ad policy (GDPR, tier, cooldowns)
- **L1 Profiles** -- 15 language transfer profiles with 40 false friends, 15 phonetic difficulties, 15 grammar gaps each

### `packages/db` -- 29 tables, 20 enums

Users, courses, sections, units, lessons, exercises, audio clips, user progress, lesson completions, streaks, league entries, user follows, daily quests, monthly quest progress, transactions, wallets, shop items, IAP receipts, conversation sessions, achievements, ad events, L1 cultural content, skills, knowledge items, skill prerequisites, exercise-knowledge bridge, skill evidence, skill mastery, knowledge relations, lesson-skills bridge.

### `server` -- 17 routers, 16 services, 7 jobs

**Routers:** auth, user, lesson, progress, speech, conversation, gamification, content, economy, shop, hearts, ads, pipeline, mastery, quality, analytics, quests.

**Services:** whisper (transcription), tts (Azure), llm (conversation tutor), content-generator (dynamic exercise generation with L1 profiles), seed-content (course structure seeding per L1), batch-exercise-pipeline (coverage gap detection, bulk generation), mastery-recalculator, achievement-checker, retention-metrics (D1/D7/D30 cohort retention, DAU/WAU/MAU), daily-refresh (adaptive review sessions), daily-quests, push (FCM), storage (R2), iap-validator (Apple + Google), leaderboard, revenuecat-webhook.

**Jobs (BullMQ):** generate-exercises, league-reset, streak-reminder, quality-flag, heart-refill, subscription-check, content-sync.

### `apps/mobile` -- 43 screens, 80 components, 11 hooks

**Onboarding:** welcome, sign-up/sign-in (email + Google SSO via Clerk), choose profile, language select, GDPR consent, goal, daily goal, level, placement test (10 questions, all 15 L1s), plan.

**Tabs:** learn (winding path with lesson gating, section cards, Daily Refresh banner, quest progress, section skip test), practice (FSRS review queue), league (leaderboard), shop, profile (mastery dashboard), reference.

**Lesson flow:** 8 exercise types (translate, fill blank, listen & type, match pairs, pick correct, reorder words, speak & score), feedback overlay, result screen, chest opening (Reanimated shake + reward reveal).

**Audio:** expo-audio for playback (`useAudioPlayer` + `useAudioPlayerStatus`) and recording (`useAudioRecorder` with `RecordingPresets.HIGH_QUALITY`). Recorded audio is read as base64 via expo-file-system.

**Components:** UI primitives (Button, Card, Modal, Toast), exercise renderers, audio (player, recorder), gamification (XP bar, streak badge, league card, achievement toast, mastery dashboard with CEFR estimate), paywall (hearts, mid-lesson, Super upsell), shop (ouro balance, IAP modal), pronunciation (animated mouth diagram SVG, phoneme cards, L1-based guide), tappable text with word tooltips (170+ words, 15 L1s, gender pair display), SVG icon system (react-native-svg).

### `cms` -- 11 collections, 35 prompt templates

Courses, Units, Lessons, Exercises (drafts/review/live workflow), Vocabulary, Audio Clips, L1 Cultural Content, Review Queue, Skills, KnowledgeItems, Users. 35 prompt templates for dynamic exercise generation.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm 9.12+
- Docker (for local PostgreSQL + Redis)

### Local Development

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Push database schema
pnpm db:push

# Seed course data (optional)
pnpm --filter @falatorio/server tsx src/scripts/seed-courses.ts

# Start server in dev mode
pnpm --filter @falatorio/server dev

# Start mobile app (separate terminal)
pnpm --filter @falatorio/mobile start
```

### Environment Variables

```
# Required
DATABASE_URL=           # PostgreSQL connection string (Neon in production)
REDIS_URL=              # Redis connection string (Upstash in production)

# Auth (optional -- app runs in preview mode without it)
CLERK_SECRET_KEY=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# AI
ANTHROPIC_API_KEY=      # Claude conversation tutor + content generation
OPENAI_API_KEY=         # Whisper transcription

# Speech
AZURE_SPEECH_KEY=       # Azure Neural TTS
AZURE_SPEECH_REGION=    # default: westeurope

# Storage
R2_ACCOUNT_ID=          # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Payments
REVENUECAT_API_KEY=
REVENUECAT_WEBHOOK_SECRET=

# Push Notifications
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=

# Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=   # default: https://eu.i.posthog.com

# Mobile
EXPO_PUBLIC_API_URL=        # Server URL for the mobile app
```

### Mobile Builds (EAS)

```bash
cd apps/mobile

# Preview APK (internal testing)
npx eas build --profile preview --platform android

# Production AAB (Play Store)
npx eas build --profile production --platform android
```

The mobile app runs without `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in preview mode: auth is skipped, navigation is gated by MMKV onboarding state.

### Server Deployment (Railway)

The server deploys to Railway via a multi-stage Dockerfile. External services: Neon PostgreSQL, Upstash Redis.

```bash
# Build and run locally with Docker
docker build -t falatorio-server .
docker run -p 3001:3001 --env-file .env.local falatorio-server
```

Railway config (`railway.json`) uses the Dockerfile builder with a `/health` healthcheck endpoint.

## Visual Identity

- Currency: **ouro** -- represented as 3 gold prisms of different sizes, grouped together with golden tones, light, and shadow detail
- No emojis anywhere -- all icons are SVG via react-native-svg
- Portuguese visual identity throughout
- Reward animation: top-down camera, hands open a cord-tied sack to reveal shiny golden coins
- All UI strings translatable via `useTranslation()` hook

## License

Private.
