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

HeartSync is an iOS native couple app with a companion Web experience. The product vision is to make both iOS and Web feel polished, interactive, and emotionally coherent.

The iOS app is the primary product. It emphasizes native interaction, SwiftUI, Keychain, and MapKit route snapshots.

The Web app is not merely an admin console. It is a warm desktop review experience that lets reviewers operate a bounded version of the core workflow without running an iOS simulator. It uses the same module language as iOS, but it is not an iOS-equivalent second client.

Delivery is staged to control scope:

- Core MVP: backend, database, Web review flow, shared sync cards, daily sync, promise planning, review metrics, local template reports, tests, CI, Docker, and README.
- iOS Excellence Track: full SwiftUI product polish remains the goal, but the minimum iOS acceptance slice is Today, Promises route cover, Review rendering, Us settings, Keychain storage, and MapKit route snapshot integration.
- AI/Polish Track: real LLM provider calls, advanced safety filtering, animation polish, and richer monthly analysis are enhancements that must not block the Core MVP.

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

9. As a user, I want HeartSync to generate a gentle template or mock-AI trend explanation and private message draft so that I can better express myself even without a real LLM key.

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
- The backend generates a 6-character uppercase alphanumeric pairing code, excluding ambiguous characters `0`, `O`, `1`, and `I`.
- Another user can join by entering the code.
- A couple space has at most two members.
- Pairing codes are normalized by trimming whitespace and uppercasing before lookup.
- A pairing code expires 24 hours after creation.
- Regenerating a pairing code invalidates the previous active code for the same couple.

Output:

- couple profile;
- members;
- pairing status.

Error handling:

- invalid pairing code returns a clear error;
- expired pairing code returns a clear error;
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
- visibility: `partner_visible` or `private`;
- sync date.

Behavior:

- Each user can create or update one daily sync per date.
- Selecting a card fills in default scores.
- The user can adjust scores before sending.
- The Today page shows both partners' daily state.
- Historical data powers trends and reports.

Visibility behavior:

- `partner_visible` is the default.
- For `partner_visible` syncs, the partner can see the selected card, tags, scores, and note on Today surfaces.
- For `partner_visible` syncs, note text can be included in shared template/mock LLM inputs if it is selected by the note-selection rule.
- For `private` syncs, the partner only sees that the user has synced today; card, tags, scores, and note are hidden from the partner's Today surface.
- For `private` syncs, the record counts toward sync rate and anonymous aggregate metrics such as average mood, energy, and longing.
- For `private` syncs, note text is excluded from shared report text and shared LLM inputs.
- For `private` syncs, note text may be used only for the current user's private message draft.

Output:

- today's sync status for both members;
- trend input for Review.

Error handling:

- invalid score outside 1-5 is rejected;
- invalid visibility values are rejected;
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
- optional start latitude/longitude;
- optional destination latitude/longitude;
- notes.

Behavior:

- The Promises tab is calendar-first.
- Users can create, edit, complete, and postpone promises.
- Completing a promise sets status to `completed` and records `completedAt`.
- Postponing a promise requires `newScheduledAt` and optional `postponeReason`.
- Postponing a promise sets status to `postponed`, records `postponedFrom`, records `postponeReason` when present, and updates `scheduledAt` to `newScheduledAt`.
- Core MVP obtains coordinates only from manual input or demo seed locations.
- Backend stores submitted place text and coordinates; it does not perform geocoding.
- Web can display and edit place text and coordinate fields but does not search maps.
- iOS Excellence Track may use MapKit search or place selection to fill coordinates before submitting the plan.
- iOS generates a MapKit route snapshot from start to destination when both endpoints have coordinates.
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
- Backend does not call third-party geocoding APIs.
- Plans without complete coordinates remain valid but show a non-map fallback cover.

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

Formula details:

- `syncStabilityScore` = sync rate percent for the selected period.
- `emotionalTrendScore` starts at 70, adds up to 15 points for non-negative mood trend, adds up to 10 points for non-negative energy trend, adds up to 5 points when longing is stable or improving, and is clamped to 0-100.
- `sharedProgressScore` = completed promises divided by completed plus postponed plus overdue promises in the selected period, multiplied by 100. If there are no promises in the period, use 70 as a neutral score.
- `relationshipTemperature` = round(`syncStabilityScore` * 0.35 + `emotionalTrendScore` * 0.35 + `sharedProgressScore` * 0.30).
- All component scores are integers from 0 to 100.
- If fewer than 3 daily sync records exist in the period, the report must show "insufficient data" and avoid trend claims, while still showing available raw counts.

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

- structured metrics summary;
- high-frequency cards and tags;
- promise completion/postponement summary;
- selected `partner_visible` notes;
- current user's own `private` notes only when generating that user's private message draft;
- optional provider config for AI Excellence Track: OpenAI-compatible base URL, model, and API key from iOS Keychain.

Behavior:

- Core MVP generates the same analysis shape with local templates and a mock LLM provider.
- Backend defines an LLM client interface so template/mock and real providers share one contract.
- Backend requires structured JSON-like output from the mock and real providers.
- AI Excellence Track adds real OpenAI-compatible provider calls.
- In AI Excellence Track, iOS stores the key in Keychain and sends it to the backend only for the current request.
- Backend never persists or logs the key.
- If real LLM output is unavailable, malformed, or unsafe, the backend falls back to local templates.

Note selection rule:

- Shared analysis uses only `partner_visible` notes from the current report period.
- Shared analysis includes at most 3 notes.
- If the user explicitly selects notes for a report, use selected `partner_visible` notes in the user's selected order.
- If the user does not select notes, use the latest 3 `partner_visible` notes in the period, sorted by sync date descending.
- If fewer than 3 eligible notes exist, use all eligible notes.
- If no eligible notes exist, pass an empty note array.
- Each selected note is truncated to 120 characters before template, mock, or real provider input.
- `private` notes never enter shared summary, trend explanation, or shared suggestions.
- The current user's `private` notes may be used only for `privateMessageDraft`, with at most the latest 1 private note in the period, truncated to 120 characters.

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

- Unsafe categories are `diagnosis`, `blame`, `breakup_advice`, `manipulation`, `privacy_violation`, `location_tracking`, and `self_harm_or_violence`.
- The backend checks generated `sharedSummary`, `trendExplanation`, `suggestions`, and `privateMessageDraft` before saving or returning generated text.
- If any generated field matches an unsafe category, the backend discards the whole mock or real provider response, records matching categories in `riskFlags`, and returns local template output instead.
- `diagnosis`: generated text claims or implies a psychological diagnosis, personality disorder, attachment disorder, or medical/mental-health conclusion.
- `blame`: generated text assigns fault to one partner as the main explanation for relationship problems.
- `breakup_advice`: generated text directly recommends breaking up, threatening breakup, or using breakup as leverage.
- `manipulation`: generated text recommends guilt, jealousy, punishment, silent treatment, coercion, or strategic withholding.
- `privacy_violation`: generated text asks for full chat history, private note exposure, hidden monitoring, or secret access to a partner's device/account.
- `location_tracking`: generated text asks for realtime location tracking or location history beyond user-entered promise route data.
- `self_harm_or_violence`: generated text includes self-harm, threats, violence, or instructions for harm.
- Local template fallback text must avoid all unsafe categories.
- The UI shows a neutral fallback state such as "We used a safer local reflection because AI output was unavailable or unsuitable" without exposing unsafe text.

### 5.8 Web Experience

Input:

- demo couple;
- selected acting user;
- same backend APIs as iOS.

Behavior:

- Web is a warm desktop app, not an admin console.
- Users can switch between two demo users.
- Users can manage sync cards, submit and update daily syncs, create/complete/postpone promises, and view generated reviews.
- Web shows route text, start/destination coordinates when available, and Apple Maps links for promise routes.
- Web renders a right-side impact panel showing how the current action affects sync rate, promise stats, or review readiness.
- Web can reset demo data.
- Web can show LLM status and local template or mock LLM fallback.

Output:

- bounded reviewable product flow from a browser.

Boundary conditions:

- Web does not generate native MapKit snapshots.
- Web does not use iOS Keychain.
- Web does not accept or store real LLM API keys in MVP.
- Web does not implement a mobile responsive app equivalent to iOS.
- Web does not duplicate core analytics logic; it calls backend APIs for calculations.
- Web can display route information and map links.
- iOS remains the primary native experience.

## 6. Non-Functional Requirements

### 6.1 Security

- Real API keys must never be committed.
- Core MVP uses template and mock LLM analysis, not real API keys.
- AI Excellence Track stores the LLM API key in iOS Keychain.
- AI Excellence Track allows the backend to receive the key only for a single analysis request.
- Backend must redact Authorization headers from logs even when using mock clients.
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

- For demo-scale data of 2 users, 30 daily sync records, 20 plans, and 20 sync cards, `GET /couples/:coupleId/today` should return in under 300 ms on a local development machine.
- For the same demo-scale data, `POST /couples/:coupleId/insights/generate` with local template or mock provider should return in under 800 ms on a local development machine.
- Map snapshot generation is asynchronous in the iOS view layer and must not block rendering of plan title, date, status, and fallback cover.

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
- `pairingCodeExpiresAt`
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
- `visibility` must be one of `partner_visible` or `private`.
- `private` records are included in aggregate metrics but their note text must not appear in shared reports or partner-visible Today responses.

### Plan

- `id`
- `coupleId`
- `title`
- `type`
- `scheduledAt`
- `status`
- `ownerUserId`
- `completedAt`
- `postponedFrom`
- `postponeReason`
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
- `completedAt` is set only when status is completed.
- `postponedFrom` is set only when status is postponed.
- latitude and longitude fields are nullable.
- a route-enabled plan must include all four coordinate values: start latitude, start longitude, destination latitude, and destination longitude.
- plans without complete coordinates must render a fallback cover and must not attempt route snapshot generation.

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

SwiftUI is selected for native iOS UI and because the project explicitly targets an iOS-first app. MapKit provides native route snapshots and Apple Maps integration. In the iOS Excellence Track, Keychain stores the user-provided LLM API key for real provider calls.

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

Core MVP uses local templates and a mock LLM provider behind the same structured analysis interface. AI Excellence Track adds OpenAI-compatible chat completions through user-configurable `baseURL`, `model`, and `apiKey`. This supports OpenAI, DeepSeek, Tongyi-compatible gateways, or other compatible providers without making real provider access a Core MVP dependency.

## 11. Credential and Distribution Design

Credential design:

- Core MVP does not require a real LLM key.
- AI Excellence Track stores API key in iOS Keychain.
- AI Excellence Track iOS settings page allows create/update/clear.
- UI only shows configured/unconfigured, never raw key.
- Backend accepts the key only for the current request when real provider mode is enabled.
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
- insufficient-data behavior for review reports with fewer than 3 daily sync records;
- sync rate;
- average mood/energy/longing;
- trend deltas;
- promise completion stats;
- card score validation;
- local report template generation;
- deterministic note selection for analysis: selected notes preferred over automatic latest notes, max 3 shared notes, private notes excluded from shared inputs, and latest 1 private note allowed only for private message draft;
- unsafe analysis detection: each unsafe category can be matched, unsafe provider output is discarded, risk flags are recorded, and local template fallback is returned;
- mock LLM JSON parsing and fallback.

API tests:

- device user creation;
- couple creation and join;
- pairing code normalization, expiry, regeneration, full-couple rejection, and already-in-couple rejection;
- max two couple members;
- sync card CRUD and archive;
- daily sync create/update uniqueness;
- plan create/complete/postpone, including required `newScheduledAt` for postponement and `completedAt`/`postponedFrom` updates;
- insights generate without LLM;
- analysis endpoint with template output, mock success, malformed JSON, unsafe output, and provider failure.

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

- `npm run test` must run backend unit and API tests.
- `npm run build:web` must build the Web app.
- `npm run verify` must run tests plus Web build.
- CI must run `npm run verify`.
- Docker distribution check must run `docker compose config` and a backend image build when Docker is available.

## 13. Acceptance Criteria

1. A fresh reviewer can open Web, reset demo data, switch users, submit syncs, create a promise, and generate a review.

2. iOS app can create a device-bound user and join or create a couple with a pairing code.

3. Pairing code behavior is deterministic: codes are 6-character uppercase alphanumeric strings without ambiguous characters, expire after 24 hours, normalize lowercase/whitespace input, reject full couples, and reject users already in another couple.

4. Couple members can create and edit shared sync cards with explicit score mappings.

5. Each user can submit or update one daily sync per day.

6. Today page shows both members' daily sync status.

7. A `private` daily sync appears to the partner as synced-with-hidden-content, still counts toward sync rate, and does not expose note text in shared reports.

8. Promise calendar supports at least date, anniversary, and joint task plans.

9. Completing a promise records `completedAt`; postponing a promise requires `newScheduledAt`, records `postponedFrom`, updates `scheduledAt`, and keeps an optional `postponeReason`.

10. Given a route-enabled plan with complete start and destination coordinates, iOS plan cards can render a route snapshot request or fallback snapshot UI and open Apple Maps.

11. Review page displays relationship temperature, sync rate, average mood, average energy, average longing, promise stats, and 7/30 day trend deltas computed from the specified formula.

12. Reports with fewer than 3 daily sync records show "insufficient data" for trend claims while still showing available raw counts.

13. Core MVP generates local template analysis and mock LLM-shaped analysis without a real LLM key.

14. The app can render structured analysis with shared and private sections with correct visibility from template/mock output. Real LLM provider rendering is part of AI Excellence Track.

15. Note selection for analysis is deterministic: shared sections use at most 3 `partner_visible` notes from the report period, while `private` notes are excluded from shared sections.

16. Unsafe mock or real provider output is never returned to clients: the backend records `riskFlags` and returns local template fallback instead.

17. Backend does not persist LLM keys.

18. `npm run verify` runs backend tests and Web build with one command.

19. CI runs `npm run verify` successfully.

20. README explains setup, credentials, Docker, iOS running, Web review, and limitations.

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

Risk: scope is large because the product vision includes polished iOS, polished Web, backend, analytics, LLM, and distribution.

Mitigation: delivery is staged. The Core MVP is the non-negotiable reviewable slice: backend, Web review flow, shared sync cards, daily sync, promise calendar, review metrics, local template report, tests, CI, Docker, and README. iOS completeness and real LLM calls are excellence tracks that should be implemented after the Core MVP is stable.

Risk: MapKit route snapshots may be harder to test in CI.

Mitigation: abstract route snapshot generation behind an iOS service interface; unit test route data preparation and fallback UI separately.

Risk: LLM output may be unsafe or malformed.

Mitigation: Core MVP must work with local templates and mock LLM responses. Real provider calls require JSON, schema validation, unsafe-content checks, and local fallback.

Risk: device-bound identity is not production-grade.

Mitigation: document it clearly as MVP identity. Keep data model extensible for future accounts.

Risk: Web version could become a second full product.

Mitigation: Web is limited to bounded review workflows: acting-user switch, sync card CRUD, daily sync, promise CRUD/status changes, review generation, route text/link display, demo reset, and service/LLM status. It does not implement MapKit snapshots, Keychain credential entry, mobile-responsive parity, or independent analytics logic. iOS remains the primary native product.

## 16. Current MVP, Excellence Tracks, and Add-On Split

Core MVP:

- Node.js TypeScript backend;
- SQLite + Prisma schema;
- React + Vite Web experience covering bounded review workflows;
- device-bound users;
- pairing code couple join;
- shared sync card library;
- daily sync;
- promise calendar with manual route data;
- review metrics and relationship temperature;
- local template report;
- tests, CI, Docker, README.

iOS Excellence Track:

- SwiftUI iOS app with Today, Promises, Review, and Us tabs;
- Today screen and shared sync card selection;
- Promises screen with MapKit route snapshot cover;
- Review screen rendering metrics returned by the backend;
- Us/settings screen with Keychain-backed LLM settings;
- iOS route snapshot fallback UI for test and simulator constraints.

AI/Polish Track:

- optional real LLM provider calls through OpenAI-compatible settings;
- structured LLM JSON analysis;
- unsafe-content filtering beyond template fallback;
- private communication draft rendering;
- richer motion and interaction polish across iOS and Web.

Add-ons:

- dual-origin route covers;
- common places library;
- cached map covers;
- notification reminders;
- relationship language timeline;
- richer monthly LLM reports;
- Web animation polish.
