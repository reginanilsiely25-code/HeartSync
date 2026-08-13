# HeartSync SPEC

## Project Type

HeartSync is an AI4SE Final Project B non-harness application project. It is an iOS-first relationship product with a bounded Web review client, a TypeScript backend, persistent data, tests, CI, Docker distribution, and course documentation.

## Problem Statement

Couples often message each other frequently but still miss daily emotional context, energy level, longing, and shared-plan progress. HeartSync gives partners a lightweight ritual for expressing daily state through shared sync cards, managing meaningful promises, and reviewing relationship rhythm without turning the app into a diagnosis or scorecard.

The target users are long-distance or busy couples who want shared language, low-effort daily check-ins, calendar-based promises, gentle trend reflection, and optional AI-shaped communication drafts.

## Core MVP Scope

The Core MVP includes:

- Node.js 20, TypeScript, Fastify backend.
- SQLite database accessed through Prisma.
- Device-bound user identity using `X-Device-User-Id`.
- Couple creation and join through deterministic pairing codes.
- Shared sync card library with title, icon text, color, tags, and default mood, energy, and longing scores.
- Daily sync upsert with `partner_visible` and `private` visibility.
- Promise planning for dates, anniversaries, and joint tasks with manual route data.
- Relationship review metrics, relationship temperature, insufficient-data handling, and local template or mock LLM-shaped reports.
- React and Vite Web review flow for demo reset, acting-user switch, daily sync, promise planning, and review generation.
- Tests, CI, Docker Compose, and setup documentation.

## iOS Excellence Slice

The iOS slice is the native product expression of HeartSync. It includes SwiftUI Today, Promises, Review, and Us tabs, backend DTO consumption, Keychain-backed LLM settings abstraction, and MapKit route snapshot support behind a testable route snapshot service.

The minimum iOS acceptance slice is:

- Today screen with both members' sync state, card selection, score controls, note input, and visibility selection.
- Promises screen with route-enabled promise cards, fallback covers when coordinates are incomplete, and Apple Maps links.
- Review screen rendering backend metrics, relationship temperature, template or mock analysis, private draft visibility, and fallback state.
- Us/settings screen showing profile, pairing state, service status, and configured/unconfigured LLM state without exposing raw keys.
- XCTest coverage for Today state mapping, route fallback behavior, and Keychain test doubles.

## Explicit Non-Goals

HeartSync does not include realtime chat, realtime location, route tracking, full navigation, password or email accounts, App Store or TestFlight release, media album storage, payments, subscriptions, psychological diagnosis, relationship blame, breakup advice, automatic sending of generated messages, full chat history upload, or uploading private notes to shared LLM analysis.

## Data Model

The data model contains these core entities:

- `User`: device-bound profile with `deviceUserId`, display name, avatar color, and memberships.
- `Couple`: two-person relationship space with pairing code, expiry, creator, and members.
- `CoupleMember`: membership join table with role and joined time.
- `SyncCard`: shared expression card with title, icon text, color, tags JSON, default mood score, default energy score, default longing score, archive state, creator, and couple.
- `DailySync`: one sync per user per date, linked to a card, with mood, energy, longing, tags, note, and visibility.
- `Plan`: promise item with type, scheduled date, status, owner, completion or postponement fields, route place names, optional coordinates, notes, and timestamps.
- `InsightReport`: period report with metrics JSON, relationship temperature, template summary, optional LLM-shaped shared fields, and generation time.
- `PrivateSuggestion`: private message draft scoped to one user and one report.

Important constraints include unique `(userId, syncDate)` daily syncs, maximum two active couple members, 1-5 score bounds, 24-hour pairing-code expiry, and route snapshot eligibility only when all four coordinate values are present.

## API Surface

HeartSync uses REST resources plus action endpoints:

- `POST /users/device`
- `PATCH /users/:userId`
- `POST /couples`
- `POST /couples/join`
- `GET /couples/:coupleId`
- `GET /couples/:coupleId/sync-cards`
- `POST /couples/:coupleId/sync-cards`
- `PATCH /sync-cards/:cardId`
- `DELETE /sync-cards/:cardId`
- `GET /couples/:coupleId/daily-syncs?from=&to=`
- `PUT /couples/:coupleId/daily-syncs/:date`
- `GET /couples/:coupleId/today`
- `GET /couples/:coupleId/plans?from=&to=&status=`
- `POST /couples/:coupleId/plans`
- `PATCH /plans/:planId`
- `POST /plans/:planId/complete`
- `POST /plans/:planId/postpone`
- `GET /couples/:coupleId/insights?period=week|month`
- `POST /couples/:coupleId/insights/generate`
- `POST /couples/:coupleId/llm-analysis`
- `POST /demo/reset`
- `GET /health`

Couple-scoped endpoints resolve the current user from `X-Device-User-Id` and verify membership before returning data.

## Privacy and Safety Rules

Private daily syncs count toward aggregate metrics but hide card, tags, scores, and note text from the partner-facing Today view. Private notes never enter shared summaries, trend explanations, shared suggestions, or shared LLM inputs. The current user's latest private note may be used only for that user's private message draft.

Shared analysis uses at most three `partner_visible` notes from the report period. Explicitly selected visible notes are used in selected order; otherwise the latest visible notes are used. Notes are truncated to 120 characters before template, mock, or provider input.

Core MVP uses local templates and mock LLM-shaped output. Real LLM calls are optional excellence work, and any API key is stored in iOS Keychain, sent only for the current request, never logged, and never persisted by the backend.

Generated output is rejected when it matches unsafe categories: `diagnosis`, `blame`, `breakup_advice`, `manipulation`, `privacy_violation`, `location_tracking`, or `self_harm_or_violence`. Unsafe, malformed, or unavailable provider output falls back to local template text and records `riskFlags`.

HeartSync does not collect realtime location. Promise route data is manually entered, and the backend stores structured place fields rather than route images.

## Testing and Acceptance Criteria

Backend unit tests cover pairing-code generation and normalization, metrics formula, insufficient-data behavior, note selection, safety filtering, local templates, and mock LLM fallback. API tests cover device users, couple creation and join, two-member limit, pairing expiry, sync card CRUD/archive, daily sync upsert, private visibility, plan creation/completion/postponement, insight generation, unsafe fallback, demo reset, and health.

Web verification covers demo user switching, daily sync submission, promise creation, review generation, and demo reset. iOS tests cover Today state mapping, route snapshot fallback logic, Keychain abstraction behavior, plan route formatting, and insight rendering.

Acceptance criteria include a reviewer opening Web at `http://localhost:5173`, resetting demo data, switching users, submitting visible and private syncs, creating or changing promises, generating a review, and observing that private notes are excluded from shared analysis. The full project must provide `npm run verify`, CI running that command, Docker Compose distribution, and README instructions for local development, Docker, Web review, and iOS source execution.
