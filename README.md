# Falatorio

A language learning app built exclusively for **European Portuguese (PT-PT)**. Mobile-first, designed for immigrants in Portugal -- including Hindi, Bengali, and Urdu speakers since there has been an increasing number of immigrants from the locations where these languages are spoken. The learning path adapts based on the learner's native language (L1), with personalized phonetic guides, animated pronunciation diagrams, false friend warnings, and culturally relevant scenarios.

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
| Database | PostgreSQL (Neon), Drizzle ORM, 30 tables + 20 enums |
| Cache/Queue | Redis (ioredis), BullMQ (6 queues) |
| Auth | Clerk (JWT, cached in Redis) -- optional, app runs in preview mode without it |
| CMS | Payload CMS v3, PostgreSQL adapter, R2 storage |
| Payments | RevenueCat (subscriptions), AdMob (GDPR-aware) |
| AI | LLM-powered conversation tutor, dynamic content generation, exercise generation; OpenAI Whisper (speech), Azure TTS |
| Storage | MMKV (device), Cloudflare R2 (audio, media) |
| CI/CD | GitHub Actions, Docker (GHCR), Railway, Vercel |
| Observability | Sentry (crash reporting, performance), PostHog (analytics, A/B testing, feature flags), custom analytics (batched event queue) |
| i18n | Custom hook-based system, 16 dictionaries (en, pt, es, fr, hi, ur, ar, bn, de, zh, ru, uk, tr, pl, ko, ja) |

## Core Concepts

### L1 Profiles

Every source language is a separate product. Each L1 profile contains phonetic transfer maps, grammar interference patterns, false friends, cognates, and cultural bridges. 15 L1 profiles: en, es, fr, de, hi, ur, ar, bn, zh, ru, uk, tr, pl, ko, ja.

All 15 profiles are fully expanded with 40 false friends, 15 phonetic difficulties (with animated mouth position diagrams), 15 grammar gaps, 16-30 cognates, and cultural references. Phase 1 (en, es, fr, hi, ur, ar, bn) and Phase 2 (de, zh, ru, uk, tr, pl, ko, ja) are at full parity.

### Skill / Knowledge / Mastery Model

The pedagogical layer sits on top of the course tree. Skills represent linguistic competencies (e.g. `PT.VERBS.PRESENT`, `PT.SYNTAX.SUBORDINATION.CAUSAL`), each decomposed into atomic KnowledgeItems. Every exercise is linked to one or more KnowledgeItems via the `exercise_knowledge` bridge table, so results flow into per-skill mastery scores rather than just per-exercise progress.

Mastery is calculated from 3 weighted signals: accuracy (recent performance, 50%), variety (exercise type diversity, 25%), and production ratio (harder output tasks vs recognition, 25%). Confidence factors in repetition count, variety, and recency. CEFR level is estimated per user by aggregating skill mastery across levels, with an explicit confidence percentage -- never a binary label.

KnowledgeItems carry 7 cognitive levels (recognition, comprehension, controlled production, transformation, translation, free production, communication) that specify which exercise types are appropriate. They also declare inter-knowledge relations (related, confusable_with, reinforces) for exercise generation and error prediction, and per-L1 difficulty metadata for personalized prioritisation.

The mastery module (`packages/core/src/mastery/`) includes: QA validator (schema, graph integrity, linguistic completeness), prerequisite checker with topological sort, coverage metrics, exercise generation spec with alignment validation, adaptive engine types for the future selector, and a readiness checker that validates Definition of Done criteria and vertical slice completeness across 10 implementation phases. The taxonomy seed contains 272 Skills and 310 KnowledgeItems across 10 domain groups (phonetics, morphology, tenses_moods, determiners, pronouns, prepositions, syntax, lexicon, pragmatics, orthography). Every KI has shortExplanation, counterexamples, commonErrors, and per-L1 difficulty metadata for all 15 languages.

The mastery logic is deterministic and auditable. AI does not drive the adaptive engine; it generates content for a structured exercise bank.

### Content Hierarchy

The learning path follows a 5-level hierarchy modelled after Duolingo:

```
Course  (1 per L1 language)
  └── Section  (1-4 numbered + Daily Refresh)
        └── Unit  (variable per section)
              └── Node  (lesson or chest)
                    └── Exercise  (dynamically generated, lessons only)
```

Sections group units by difficulty band with intentional CEFR overlap at transitions. Each unit contains a mix of lesson nodes and reward chest nodes. The last node is always a recap lesson; chests sit roughly in the middle. Units with 7+ total slots get 2 chests, smaller units get 1.

| Section | CEFR | Units | Slots/Unit | Chests/Unit | Pattern |
|---------|------|-------|-----------|-------------|---------|
| S1 Basico | A1-A2 | 10 | 5 -> 6 | 1 | Ramp up for beginners |
| S2 Principiante | A2-B1 | 30 | 7 -> 6 | 1-2 | Daily life in Portugal |
| S3 Intermedio | B2-C1 | 40 | 8 -> 6 | 1-2 | Conversation, work, culture |
| S4 Avancado | C1-C2 | 50 | 9 -> 7 | 2 | Nuance, register, mastery |

Total: 130 units, ~930 slots (lessons + chests). Chest rewards cycle through ouro, XP boosts, streak freezes, and occasional Super days.

**Section Skip Test:** Each section has a "SALTAR PARA AQUI" button that launches a placement test filtered by the section's CEFR range. Passing (80%+ accuracy) marks all lessons in that section as completed, unlocking the next section. This lets advanced learners skip content below their level.

### Daily Refresh

Not a linear section -- a parallel review layer that picks the optimal exercise mix for each user based on their current state. The `daily-refresh.service.ts` engine scores candidates from 3 sources with weighted priorities: FSRS-due items (45%, urgency by overdue days, stability penalty), low-mastery skills (30%, deficit below 0.6 threshold), and recent errors (25%, recency-weighted by severity). Exercises are interleaved across sources for variety. Session size adjusts by time of day (morning cap: 10 exercises, default: 15). A 4-hour Redis cooldown prevents overuse. Completes like any practice session (0.5x XP multiplier, no ouro, FSRS updates, skill evidence recording).

Unit themes follow a communicative progression: S1 covers survival ("Cafe, por favor!"), S2 covers autonomous daily life ("Casa, renda e senhorio"), S3 covers conversation and society ("Argumentar e defender uma ideia"), S4 covers advanced mastery ("Portugues sem legendas"). Grammar is embedded in communicative objectives, never exposed as unit titles.

### Daily Quests

3 adaptive quests generated daily based on user behaviour over the past 7 days. Quest types: complete_lesson, earn_xp, practice_speaking, review_items, maintain_streak, learn_minutes, perfect_lesson, practice_mistakes. The quest engine (`daily-quests.service.ts`) analyzes recent activity and boosts weights for quest types that target weak areas (e.g., low speaking practice boosts the speaking quest weight).

Each completed quest awards 1 point. Points accumulate daily (max 3/day) toward a monthly goal matching the number of days in the current month (30 or 31). Reaching the monthly target unlocks a reward claim. Quests reset on the 1st of each month. Even after reaching the monthly goal, daily quests continue generating for ongoing engagement and rewards.

### Dynamic Content Generation

Exercises are not statically authored. L1 profiles provide seed knowledge (false friends, grammar gaps, phonetic difficulties, cognates, cultural references), and AI generates personalized exercises dynamically based on the user's L1, CEFR level, and demonstrated weaknesses. Generated exercises are stored in the database so they are not regenerated. The seed content service creates the course structure (courses, units, lessons) per L1, while exercises fill in dynamically on demand.

### FSRS (Free Spaced Repetition Scheduler)

Exercises are scheduled using the FSRS algorithm. The system tracks stability, difficulty, and optimal review intervals per exercise per user. FSRS also feeds into the mastery layer -- review results produce skill evidence alongside spaced repetition state.

### Economy

Currency is **ouro** (ledger-based -- balance = SUM of transactions, never stored as a field). Earned through lessons, ads, and achievements. Spent on hearts, shop items, streak freezes. New users start with **500 ouro** (welcome bonus transaction created at registration).

### Heart System

Free users start with **5 hearts**, refilling 1 every 4 hours. Running out mid-lesson triggers a paywall (50 ouro to continue). Super subscribers get unlimited hearts. Completing a review session awards 1 heart (free users only, capped at 5).

### Tiers

| | Free | Super |
|---|---|---|
| Hearts | 5 (refill every 4h) | Unlimited |
| Ads | Banner + interstitial + reward | None |
| Error review | 3/day | Unlimited |
| Streak freeze | Purchasable | 1 free/month |
| Starting ouro | 500 | 500 |

### Social Features

Users can follow/unfollow each other. The social graph is stored in a `user_follows` table with composite primary key (followerId, followingId). Profile screens display follower and following counts with tappable links to a followers/following list. User profiles show XP, streak, and league tier.

### Leagues

7 tiers: Bronze, Silver, Gold, Sapphire, Ruby, Emerald, Diamond. Weekly leaderboard resets with promotion/demotion. League entries track weekly XP with tier-based promotion thresholds.

### Practice Tab

Four practice modes accessible from the practice tab:

- **Smart Review** -- random exercises from the user's completed content at 0.5x XP. Exercises never exceed the user's current progress (section + unit). Completing a review session can award 1 heart (free users below 5 hearts).
- **Pronunciation** -- L1-specific phonetic difficulty guide with animated mouth/tongue diagrams (PT-EU sounds: nasal vowels, nh/lh, uvular/flap r, sibilants). Links to conversation practice. Gated behind completing at least 1 lesson.
- **Conversation** -- AI-powered scenario-based chat with real-time pronunciation feedback. 8 scenarios gated by CEFR level. Gated behind completing at least 1 lesson.
- **Common Mistakes** -- accumulated errors (all exercises with `lapses > 0` since account creation) at 0.5x XP. Limited to 3 sessions/day for free users, unlimited for Super.

All practice sessions reuse the same exercise flow (ExerciseRenderer, FeedbackOverlay, FSRS updates, skill evidence) as regular lessons.

### Pronunciation Animations

Each phonetic difficulty in an L1 profile optionally references a `MouthPosition` value (14 positions: rest, nasal_ao, nasal_vowel, palatal_lateral, palatal_nasal, uvular_r, alveolar_tap, open_e, closed_e, open_o, closed_o, sibilant_s, sibilant_sh, labiodental_v). The `AnimatedMouthDiagram` component renders an animated cross-section SVG of the oral cavity showing tongue, jaw, lips, uvula, and nasal airflow. It uses react-native-reanimated to loop between the rest position and the target position, so learners can see the movement pattern for each sound. The animation auto-plays when a PhonemeCard is expanded and can be toggled by tapping.

### Scoring

Text scoring uses Levenshtein distance with PT-EU phonetic normalization. Speech scoring uses Whisper transcription + text scoring pipeline.

### Internationalization (i18n)

All user-facing strings are translatable via the `useTranslation()` hook (`apps/mobile/lib/i18n.ts`). The system reads the user's selected L1 from MMKV storage and resolves strings through a fallback chain: `L1 dictionary -> English -> raw key`. English is the source of truth; Portuguese (PT-PT) has full coverage with proper diacritics. All 16 dictionaries (15 L1 languages + Portuguese) have full key parity across the entire app. The placement test questions and section test questions (prompts and options) are fully translated in all 15 languages with no English fallback.

### Mastery Dashboard

The profile screen includes a mastery dashboard showing the user's estimated CEFR level with confidence percentage, domain breakdown (strong areas, areas to improve, not yet assessed), and a disclaimer that the estimate is based on practice, not a certification. The dashboard queries `mastery.getCEFREstimate` which aggregates skill mastery across all domains and CEFR levels. All labels are translated in 16 dictionaries.

### Launch Metrics

Full funnel tracking via PostHog and custom analytics: onboarding completion, placement test (start/result with level and accuracy), first lesson (with elapsed time), D1/D7 retention, mastery milestones (first skill mastered, mastery count), CEFR level progression (with confidence), trial start, and trial-to-Super conversion. Server-side retention metrics service computes D1/D7/D30 cohort retention rates, mastery progression (average mastery, skills mastered distribution), and engagement metrics (DAU/WAU/MAU, sessions per user, exercises per session) via the `analytics` tRPC router.

### Onboarding Gate

Fresh installs always land on the onboarding flow: welcome -> select-language -> choose-profile -> select-goal -> daily-goal -> select-level -> placement-test -> plan -> tabs. The root `app/index.tsx` uses Expo Router's `<Redirect>` pattern to check MMKV for onboarding completion state and route accordingly. In preview mode (no Clerk key), this is the sole entry gate. In authenticated mode, Clerk's `isSignedIn` state drives navigation. Back gesture is disabled on welcome, placement test, and plan screens to prevent accidental exits.

## Package Breakdown

### `packages/core` -- 80 files

Pure business logic, zero dependencies on I/O or frameworks:

- **FSRS** -- scheduler, rating, card state machine
- **Scoring** -- text scorer, speech scorer, PT-EU phonetic rules
- **Lesson** -- session state, adaptive exercise selector, placement test
- **Mastery** -- evidence recorder, mastery calculator (accuracy/variety/production weights), CEFR estimator with confidence scores and domain breakdown (strong/weak/unevaluated), QA validator, prerequisite checker, coverage metrics, exercise generation spec, adaptive engine types
- **Economy** -- currency ops, earn/spend rules, shop catalog, IAP tiers
- **Entitlements** -- feature gates, heart system, access checks
- **Gamification** -- XP calculator, streak logic, league promotion, 42 achievements (including 19 competence badges tied to real mastery evidence)
- **Ads** -- ad policy (GDPR, tier, cooldowns)
- **L1 Profiles** -- 15 language transfer profiles with 40 false friends, 15 phonetic difficulties, 15 grammar gaps each, plus cognates and cultural references. MouthPosition type for pronunciation animation support.

### `packages/db` -- 30 tables, 20 enums

Users (with avatarUrl), courses, sections (numbered + daily refresh, between course and unit), units, lessons (with node_type: lesson/chest and optional rewardConfig for chests), exercises, audio clips, user progress, lesson completions (gating: tracks per-user lesson completion with best accuracy and attempt count), streaks, league entries (7 tiers: bronze/silver/gold/sapphire/ruby/emerald/diamond), user follows (social graph with composite PK), daily quests (adaptive daily tasks with quest type, target/current values, completion tracking), monthly quest progress (points per month with reward claim), transactions, wallets, shop items, IAP receipts, conversation sessions, achievements, ad events, L1 cultural content, skills, knowledge items, skill prerequisites, exercise-knowledge bridge (with primary/secondary flag), skill evidence, skill mastery, knowledge relations (related/confusable/reinforces), lesson-skills bridge (curriculum mapping). 6 Drizzle migrations: initial schema, knowledge graph + skills, chest node_type enum + reward_config, lesson completions, social + league tiers, daily quests.

### `server` -- 17 routers, 14 services, 7 jobs

**Routers:** auth, user, lesson, progress, speech, conversation, gamification, content (with skipSection mutation), economy, shop, hearts, ads, pipeline, mastery, quality, analytics, quests.

**Services:** Whisper (transcription), Azure TTS, LLM (conversation tutor), content generator (dynamic lesson/exercise generation with inline glossary and gender pairs using L1 profiles), seed content (course structure seeding per L1), batch exercise pipeline (coverage gap detection, bulk generation with concurrency control, auto-links exercises to KnowledgeItems), mastery recalculator (batch skill mastery recomputation), achievement checker (competence badge evaluation), retention metrics (D1/D7/D30 cohort retention, mastery progression, DAU/WAU/MAU engagement), daily refresh (adaptive review session builder -- picks exercises from 3 weighted sources: FSRS due items 45%, low mastery skills 30%, recent errors 25%; adjusts session size by time of day; 4h cooldown between sessions), daily quests (adaptive quest generation, progress tracking, monthly point accumulation, reward claiming), FCM push, R2 storage, IAP validation (Apple + Google), RevenueCat webhooks.

**Jobs (BullMQ):** exercise generation (uses content-generator service, auto-links to KnowledgeItems via lesson skills), league reset, streak reminders, quality flagging, heart refill, subscription checks, content sync.

### `apps/mobile` -- 42 screens, 80 components, 11 hooks

**Root:** `index.tsx` redirect gate (onboarding vs tabs based on MMKV state).

**Onboarding:** welcome, sign-up/sign-in (email + Google SSO via Clerk), choose profile, language select, GDPR consent, goal, daily goal, level, placement test (10 questions, all 15 L1s, no early termination), plan.

**Tabs:** learn (Duolingo-style winding path with lesson-to-lesson gating, section cards with progress bars, Daily Refresh locked banner, daily quest progress banner, section skip test buttons), practice (FSRS review queue), league (leaderboard), shop, profile (with follower/following counts and mastery dashboard), reference.

**Lesson flow:** exercise screen with 8 exercise types (translate, fill blank, listen & type, match pairs, pick correct, reorder words, speak & score), feedback overlay, result screen, chest opening screen (Reanimated shake + reward reveal animation). Practice modes (review, mistakes, daily refresh) use the same exercise flow via `usePracticeSession` hook.

**Conversation:** scenario picker, chat with AI-powered PT-EU tutor with error extraction.

**Social:** follower/following list (tab switching, user rows with avatar/XP, tappable profile navigation), user profile view.

**Daily Quests:** quest screen with monthly progress card (gold progress bar, claim reward button), individual quest cards with progress tracking, how-it-works info section, point badge showing daily progress.

**Section Test:** skip-section placement test (8 questions filtered by CEFR range, 80% pass threshold, exit confirmation modal).

**Shop:** Super subscription detail, ouro packs (standalone route + RevenueCat IAP).

**Components:** UI primitives (Button, Card, Modal, Toast, Loading), exercise renderers, lesson components (progress bar, heart indicator, feedback, PT-EU vs PT-BR toggle), audio (player, recorder, waveform), gamification (XP bar, streak badge, league card, achievement toast, mastery dashboard with CEFR estimate, confidence bar, domain breakdown), paywall (out of hearts, mid-lesson, Super upsell, feature lock, ad-or-pay choice), shop (ouro balance, item card, IAP modal, chest offer, Super banner), ads (provider, banner, interstitial, reward), pronunciation (static mouth diagram SVG, animated mouth diagram with reanimated loop, phoneme card with expandable detail, L1-based pronunciation guide), tappable text with word tooltips (170+ words, 15 L1s, gender pair display for adjectives/gendered nouns), retention tracker (session/streak analytics), SVG icon system (react-native-svg, no emojis).

### `cms` -- 11 collections, 35 prompt templates

Courses, Units, Lessons, Exercises (with drafts/review/live workflow), Vocabulary, Audio Clips (with R2 upload), L1 Cultural Content, Review Queue, Skills, KnowledgeItems, Users. Hooks auto-publish and auto-reject exercises through the review pipeline. 35 prompt templates for dynamic exercise generation (10 base types + 25 L1-specific overrides).

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
EXPO_PUBLIC_SENTRY_DSN= # Sentry crash reporting (mobile)
EXPO_PUBLIC_ANALYTICS_ENDPOINT= # Custom analytics endpoint
EXPO_PUBLIC_POSTHOG_API_KEY= # PostHog analytics, A/B testing, feature flags
EXPO_PUBLIC_POSTHOG_HOST= # PostHog host (default: https://eu.i.posthog.com)
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

- **ci.yml** -- lint, typecheck, test (with Postgres + Redis services), build, DB migration check on PRs
- **deploy-server.yml** -- Docker build to GHCR, deploy to Railway, run DB migrations
- **deploy-cms.yml** -- Docker build to GHCR, deploy to Railway
- **deploy-web.yml** -- Build and deploy to Vercel

## Visual Identity

- Currency: **ouro** -- represented as 3 gold prisms of different sizes (small, large, medium), grouped together with golden tones, light, and shadow detail
- No emojis anywhere -- all icons are SVG via react-native-svg for cross-platform consistency
- Portuguese visual identity throughout
- Reward animation: top-down camera, hands open a cord-tied sack to reveal shiny golden coins inside
- All UI strings translatable via `useTranslation()` hook -- supports 16 dictionaries with English fallback

## License

Private.
