# HeartSync Design Spec

Date: 2026-07-08
Status: approved design draft
Project type: AI4SE Final Project B, non-harness application project

## 1. Problem Statement

HeartSync is an iOS-first relationship app for couples who want a lightweight but meaningful way to stay aware of each other's daily state, shared plans, and relationship rhythm.

The product is not a chat app. It solves a narrower problem: couples often miss each other's emotional context even when they message frequently. HeartSync lets them create shared "status codes", sync daily feelings with low effort, plan meaningful moments, and review recent relationship patterns without turning the relationship into a judgmental scorecard.

The target users are couples, especially long-distance couples or busy couples, who want:

- a daily ritual that is lighter than journaling;
- shared language for expressing mood, energy, and longing;
- a place to manage dates, anniversaries, and joint tasks;
- trend-based reflection that is helpful but not diagnostic;
- optional AI-written relationship explanations and communication drafts.

The project is valuable as a software engineering project because it combines native iOS interaction, MapKit integration, a real backend, a web experience version, structured analytics, credential handling, optional LLM integration, tests, CI, and distribution.

## 2. Product Positioning

HeartSync is an iOS native couple app with a companion Web experience.

The iOS app is the primary product. It emphasizes native interaction, SwiftUI, Keychain, and MapKit route snapshots.

The Web app is not merely an admin console. It is a warm desktop experience that lets reviewers and users operate the same core workflows without running an iOS simulator. It supports the same main modules: Today, Promises, Review, and Us.

The product language should stay gentle. Analytics are framed as "relationship temperature" or "closeness rhythm", not as relationship health diagnosis.

## 3. Core Navigation

The primary tabs are:

- Today: shared daily state and quick sync.
- Promises: calendar-first plans for dates, anniversaries, and joint tasks.
- Review: trend metrics, relationship temperature, weekly or monthly reports, and optional LLM analysis.
- Us: couple profile, shared sync card library, pairing state, LLM settings, demo/reset controls, and service status.

## 4. User Stories

1. As a first-time user, I want to create a device-bound profile with my nickname and avatar color so that I can enter the app without a full password account.

2. As a user, I want to create a couple space and share a pairing code so that my partner can join the same HeartSync space.

3. As a couple, we want to create our own shared sync cards with custom titles, emojis, colors, tags, and default scores so that daily sync feels like our own language.

4. As a user, I want to choose a shared sync card, optionally adjust scores, and add one short note so that my partner can understand how I am doing today.

5. As a user, I want to see both partners' daily sync status on the Today page so that I can quickly know whether we have both checked in.

6. As a couple, we want to create promises for dates, anniversaries, and joint tasks so that shared moments become visible and trackable.

7. As a user, I want each promise card to show a route snapshot from a manually entered start place to a destination so that the plan feels concrete and native to iOS.

8. As a user, I want to see weekly and monthly trends in sync rate, mood, energy, longing, and promise completion so that we can reflect on relationship rhythm.

9. As a user with an LLM key, I want HeartSync to generate a gentle trend explanation and a private message draft so that I can better express myself.

10. As a reviewer, I want to open a Web version, switch between the two demo users, perform core workflows, and reset demo data so that I can verify the project quickly.

## 5. Functional Specification

### 5.1 Device-Bound User Identity

Input:

- nickname;
- avatar color;
- generated `deviceUserId`.

Behavior:

- On first launch, iOS generates and stores `deviceUserId` locally.
- The backend creates or returns the user for that `deviceUserId`.
- Users can update display name and avatar color.

Output:

- current user profile;
- backend `userId`;
- membership state if the user is already in a couple.

Boundary conditions:

- This is an MVP identity model, not a production account system.
- Changing devices requires rejoining a couple or future account migration.
- No password, email verification, or full token auth is in scope.

### 5.2 Couple Pairing

Input:

- current user;
- optional pairing code.

Behavior:

- A user can create a couple space.
- The backend generates a pairing code.
- Another user can join by entering the code.
- A couple space has at most two members.

Output:

- couple profile;
- members;
- pairing status.

Error handling:

- invalid pairing code returns a clear error;
- full couple returns a clear error;
- users already in another couple cannot silently join another one.

### 5.3 Shared Sync Card Library

Input:

- title;
- emoji or icon text;
- color;
- tags;
- default mood score, 1-5;
- default energy score, 1-5;
- default longing score, 1-5.

Behavior:

- Both members share one card library.
- Users can create, edit, archive, and list cards.
- Cards are archived rather than physically deleted when they have historical sync records.
- Demo seed data includes expressive cards such as "想你爆炸", "电量不足", "需要抱抱", and "今天发光".

Output:

- active cards for daily sync;
- archived cards for history if needed.

Boundary conditions:

- Default scores are transparent and testable.
- Cards are a user-defined expression layer, not medical or psychological categories.

### 5.4 Daily Sync

Input:

- selected sync card;
- optional adjusted mood score;
- optional adjusted energy score;
- optional adjusted longing score;
- tags;
- note;
- visibility;
- sync date.

Behavior:

- Each user can create or update one daily sync per date.
- Selecting a card fills in default scores.
- The user can adjust scores before sending.
- The Today page shows both partners' daily state.
- Historical data powers trends and reports.

Output:

- today's sync status for both members;
- trend input for Review.

Error handling:

- invalid score outside 1-5 is rejected;
- missing card is rejected unless the API explicitly supports a manual sync fallback;
- duplicate same-day submission updates the existing record.

### 5.5 Promise Calendar

Input:

- title;
- type: date, anniversary, joint task;
- scheduled date/time;
- status: not started, in progress, completed, postponed;
- owner;
- manual start place;
- destination;
- start latitude/longitude;
- destination latitude/longitude;
- notes.

Behavior:

- The Promises tab is calendar-first.
- Users can create, edit, complete, and postpone promises.
- iOS generates a MapKit route snapshot from start to destination.
- The backend stores structured place data, not the image.
- Tapping a route card opens Apple Maps.

Output:

- calendar markers;
- promise list for a selected date;
- promise stats for Review.

Boundary conditions:

- No realtime location.
- No route tracking.
- No navigation state storage.
- Start place is manually entered.

### 5.6 Review Metrics

Input:

- daily syncs;
- sync cards and tags;
- promises;
- selected period, week or month.

Behavior:

- Calculate sync rate.
- Calculate average mood, energy, and longing.
- Calculate low mood days.
- Calculate promise completion and postponement counts.
- Calculate 7-day and 30-day trends.
- Calculate relationship temperature.

Relationship temperature formula:

- sync stability: 35%;
- emotional trend: 35%;
- shared progress: 30%.

Output:

- numeric metrics;
- trend deltas;
- relationship temperature;
- local template summary.

Boundary conditions:

- The score is a reflection aid, not a relationship health judgment.
- Missing data produces "insufficient data" messages instead of misleading precision.
- Reports should explain what data went into the score.

### 5.7 LLM Love Insight Assistant

Input:

- OpenAI-compatible base URL;
- model;
- API key from iOS Keychain;
- structured metrics summary;
- high-frequency cards and tags;
- promise completion/postponement summary;
- selected non-private notes.

Behavior:

- iOS stores the key in Keychain.
- iOS sends the key to the backend only for the current LLM request.
- Backend does not persist or log the key.
- Backend calls an OpenAI-compatible chat completions endpoint.
- Backend requires structured JSON output.
- If LLM is unavailable, malformed, or unsafe, the backend falls back to local templates.

Expected JSON shape:

```json
{
  "sharedSummary": "This week you stayed mostly in sync.",
  "trendExplanation": "Longing increased while promise completion decreased.",
  "suggestions": [
    "Plan a low-pressure call.",
    "Split the next promise into one smaller step."
  ],
  "privateMessageDraft": "I am a bit tired today, but I still miss you.",
  "riskFlags": []
}
```

Visibility:

- shared summary, trend explanation, and suggestions are visible to both partners;
- private message draft is visible only to the current user;
- no generated text is sent automatically.

Safety boundaries:

- no psychological diagnosis;
- no blame assignment;
- no breakup advice;
- no manipulative communication tactics;
- no full chat history upload;
- no private note upload;
- no realtime location upload.

### 5.8 Web Experience

Input:

- demo couple;
- selected acting user;
- same backend APIs as iOS.

Behavior:

- Web is a warm desktop app, not an admin console.
- Users can switch between two demo users.
- Users can manage sync cards, submit daily syncs, manage promises, and view reviews.
- Web can reset demo data.
- Web can show LLM status and local template fallback.

Output:

- complete reviewable product flow from a browser.

Boundary conditions:

- Web does not generate native MapKit snapshots.
- Web can display route information and map links.
- iOS remains the primary native experience.

## 6. Non-Functional Requirements

### 6.1 Security

- Real API keys must never be committed.
- LLM API key is stored in iOS Keychain.
- Backend only receives the key for a single analysis request.
- Backend must redact Authorization headers from logs.
- Web demo must not expose real secrets.
- `.env` files, local databases, generated build outputs, and temporary mockups must not be committed.

### 6.2 Privacy

- No realtime location access in MVP.
- No location tracking.
- Promise route data is explicitly entered by users.
- No full chat history upload.
- Private message drafts are private to the requesting user.
- AI output must be labeled as AI-generated and for reference only.

### 6.3 Reliability

- Core flows work without LLM.
- LLM failure falls back to local templates.
- Duplicate daily sync updates existing data.
- Demo reset restores a known dataset.
- Invalid input returns explicit API errors.

### 6.4 Performance

- Today page should load quickly from cached or recent API data.
- Review metrics should be computed within normal interactive latency for demo-scale data.
- Map snapshot generation should not block the rest of the plan UI.

### 6.5 Observability

- Backend exposes `/health`.
- Web shows service health.
- LLM status is visible as configured/unconfigured/fallback.
- Errors should be structured for API tests.

## 7. System Architecture

Components:

- SwiftUI iOS app;
- React + Vite Web app;
- Node.js TypeScript backend;
- SQLite database accessed through Prisma;
- optional OpenAI-compatible LLM provider;
- Apple MapKit and Apple Maps on iOS.

Data flow:

1. iOS creates a device-bound user.
2. User creates or joins a couple using pairing code.
3. Couple creates shared sync cards.
4. User submits daily sync with a selected card.
5. User creates promises with start/destination route data.
6. Backend computes metrics and local reports.
7. If configured, iOS sends temporary LLM credentials to backend for analysis.
8. Backend returns structured LLM JSON or template fallback.
9. iOS and Web render Today, Promises, Review, and Us surfaces.

## 8. Data Model

### User

- `id`
- `deviceUserId`
- `displayName`
- `avatarColor`
- `createdAt`
- `updatedAt`

Constraints:

- `deviceUserId` unique.

### Couple

- `id`
- `pairingCode`
- `startedAt`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Constraints:

- `pairingCode` unique while active.
- maximum two active members.

### CoupleMember

- `coupleId`
- `userId`
- `role`
- `joinedAt`

Constraints:

- unique `(coupleId, userId)`.

### SyncCard

- `id`
- `coupleId`
- `title`
- `emoji`
- `color`
- `tagsJson`
- `defaultMoodScore`
- `defaultEnergyScore`
- `defaultLongingScore`
- `isArchived`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Constraints:

- scores must be 1-5.

### DailySync

- `id`
- `coupleId`
- `userId`
- `syncDate`
- `cardId`
- `moodScore`
- `energyScore`
- `longingScore`
- `tagsJson`
- `note`
- `visibility`
- `createdAt`
- `updatedAt`

Constraints:

- unique `(userId, syncDate)`.
- scores must be 1-5.

### Plan

- `id`
- `coupleId`
- `title`
- `type`
- `scheduledAt`
- `status`
- `ownerUserId`
- `startPlaceName`
- `startLatitude`
- `startLongitude`
- `destinationName`
- `destinationLatitude`
- `destinationLongitude`
- `notes`
- `createdAt`
- `updatedAt`

Constraints:

- `type` is one of date, anniversary, joint task.
- `status` is one of not started, in progress, completed, postponed.

### InsightReport

- `id`
- `coupleId`
- `periodType`
- `periodStart`
- `periodEnd`
- `temperatureScore`
- `metricsJson`
- `templateSummary`
- `llmSharedSummary`
- `llmTrendExplanation`
- `llmSuggestionsJson`
- `generatedAt`

Constraints:

- one canonical report per couple and period can be regenerated.

### PrivateSuggestion

- `id`
- `reportId`
- `userId`
- `messageDraft`
- `generatedAt`

Constraints:

- visible only to `userId`.

## 9. API Design

API style:

- REST for resources;
- action endpoints for generation, pairing, reset, completion, and postponement.

Identity:

- client sends `X-Device-User-Id`;
- backend resolves current user;
- backend verifies couple membership for couple-scoped resources.

Endpoints:

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

## 10. Technology Choices

### iOS

SwiftUI is selected for native iOS UI and because the project explicitly targets an iOS-first app. MapKit provides native route snapshots and Apple Maps integration. Keychain stores the user-provided LLM API key.

### Backend

Node.js + TypeScript + Fastify is selected for fast iteration, shared typing with Web, typed request validation, and straightforward API testing.

### Database

SQLite + Prisma is selected for a course project because it is easy to run locally and in Docker while still providing explicit schema and migrations.

### Web

React + Vite is selected for a warm desktop Web experience that can exercise the same backend workflows.

### Design System

The primary iOS surface uses SwiftUI and follows Apple Human Interface Guidelines for navigation, controls, sheets, forms, and accessibility. The product-specific visual system is the HeartSync warm design language:

- soft but not low-contrast color tokens;
- card-based emotional surfaces for sync cards and route promises;
- dense but readable desktop Web layout;
- explicit iconography for Today, Promises, Review, and Us;
- clear privacy and AI disclosure states.

The Web experience uses the same HeartSync tokens and component vocabulary rather than a generic admin dashboard style. Open Design was considered because the course recommends it for UI projects, but the chosen approach is a native iOS-first design system aligned with Apple HIG plus a matching Web implementation. This decision should be documented again in the final root `SPEC.md`.

### LLM

OpenAI-compatible chat completions are selected through user-configurable `baseURL`, `model`, and `apiKey`. This supports OpenAI, DeepSeek, Tongyi-compatible gateways, or other compatible providers.

## 11. Credential and Distribution Design

Credential design:

- iOS stores API key in Keychain.
- iOS settings page allows create/update/clear.
- UI only shows configured/unconfigured, never raw key.
- Backend accepts the key only for the current request.
- Backend does not log or persist the key.
- Tests use fake keys and mock LLM clients.

Distribution:

- backend and Web are distributed with Docker Compose;
- README documents `docker compose up` flow;
- iOS is distributed as source with Xcode run instructions for simulator/device;
- Web URL is provided for review;
- README documents known limitations, including MVP device-bound identity.

## 12. Testing Strategy

Unit tests:

- relationship temperature formula;
- sync rate;
- average mood/energy/longing;
- trend deltas;
- promise completion stats;
- card score validation;
- local report template generation;
- LLM JSON parsing and fallback.

API tests:

- device user creation;
- couple creation and join;
- max two couple members;
- sync card CRUD and archive;
- daily sync create/update uniqueness;
- plan create/complete/postpone;
- insights generate without LLM;
- LLM endpoint with mock success, malformed JSON, and failure.

iOS tests:

- ViewModel state for Today;
- sync card selection mapping;
- Keychain settings abstraction with test double;
- plan route data formatting;
- insight rendering from API DTOs.

Web tests:

- demo user switch;
- submit daily sync;
- create promise;
- generate report;
- reset demo.

CI:

- a `unit-test` job must run core tests;
- backend tests are required;
- Web build is required;
- Docker image/build should be checked if Docker distribution is selected.

## 13. Acceptance Criteria

1. A fresh reviewer can open Web, reset demo data, switch users, submit syncs, create a promise, and generate a review.

2. iOS app can create a device-bound user and join or create a couple with a pairing code.

3. Couple members can create and edit shared sync cards with explicit score mappings.

4. Each user can submit or update one daily sync per day.

5. Today page shows both members' daily sync status.

6. Promise calendar supports at least date, anniversary, and joint task plans.

7. iOS plan cards can render a route snapshot from manual start place to destination and open Apple Maps.

8. Review page displays relationship temperature, sync rate, average mood, average energy, average longing, promise stats, and 7/30 day trend deltas.

9. Without an LLM key, the app still generates local template analysis.

10. With an LLM key, the app can request structured JSON analysis and render shared and private sections with correct visibility.

11. Backend does not persist LLM keys.

12. Tests can be run with one command.

13. CI passes.

14. README explains setup, credentials, Docker, iOS running, Web review, and limitations.

## 14. Explicit Non-Goals

- realtime chat;
- realtime location;
- route tracking;
- full navigation;
- password or email account system;
- App Store or TestFlight release as required deliverable;
- media album storage;
- payment or subscription;
- psychological diagnosis;
- relationship blame or breakup advice;
- automatic sending of AI-generated messages;
- uploading full chat history;
- uploading private notes to LLM.

## 15. Risks and Open Questions

Risk: scope is large because the project includes iOS, backend, Web, analytics, LLM, and distribution.

Mitigation: MVP must prioritize shared sync cards, daily sync, promise calendar, review metrics, and Web review flow. Add-ons such as dual-origin routes and notification reminders remain optional.

Risk: MapKit route snapshots may be harder to test in CI.

Mitigation: abstract route snapshot generation behind an iOS service interface; unit test route data preparation and fallback UI separately.

Risk: LLM output may be unsafe or malformed.

Mitigation: require JSON, validate schema, filter unsafe content, and fall back to local templates.

Risk: device-bound identity is not production-grade.

Mitigation: document it clearly as MVP identity. Keep data model extensible for future accounts.

Risk: Web version could become a second full product.

Mitigation: Web focuses on reviewable core flows and shares backend logic. iOS remains the primary native product.

## 16. Current MVP and Add-On Split

MVP:

- SwiftUI iOS app;
- React + Vite Web experience;
- Node.js TypeScript backend;
- SQLite + Prisma schema;
- device-bound users;
- pairing code couple join;
- shared sync card library;
- daily sync;
- promise calendar with manual route data;
- iOS route snapshot cover;
- review metrics and relationship temperature;
- local template report;
- optional LLM structured analysis;
- Keychain API key storage;
- tests, CI, Docker, README.

Add-ons:

- dual-origin route covers;
- common places library;
- cached map covers;
- notification reminders;
- relationship language timeline;
- richer monthly LLM reports;
- Web animation polish.
