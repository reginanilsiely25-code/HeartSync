# HeartSync PLAN

## Phase 1 Monorepo and Tooling

Create the root workspace, npm scripts, ignore rules, backend package, backend TypeScript config, Web package, Vite config, and initial dependency lockfile. The root scripts are `npm run test`, `npm run build:web`, `npm run verify`, `npm run dev:backend`, and `npm run dev:web`.

Verification for this phase checks that the npm workspace files are valid and that `npm run verify` reaches the expected missing-source point before later phases fill in the apps.

## Phase 2 Backend Domain Rules

Add the Prisma schema and test-first backend domain modules for pairing, metrics, note selection, safety detection, and template analysis. This phase establishes deterministic rules before wiring HTTP routes.

Key outputs include 6-character pairing codes without ambiguous characters, normalized pairing-code input, relationship temperature calculation, insufficient-data handling, deterministic shared/private note selection, unsafe-category detection, and local template output.

## Phase 3 Backend API and Demo Data

Build the Fastify app factory, server entrypoint, config, Prisma access, route modules, and deterministic demo reset. Couple-scoped routes use `X-Device-User-Id`, validate input with Zod, and return structured errors.

This phase implements device users, couple creation and join, sync cards, daily syncs, Today state, plans, completion, postponement, insight generation, unsafe fallback behavior, `/demo/reset`, and `/health`.

## Phase 4 Web Review Flow

Create the React and Vite desktop review client. The Web flow is bounded for course review and uses the backend for data and analytics rather than duplicating core rules.

The Web app includes tab navigation for Today, Promises, Review, and Us; acting-user switching; demo reset; daily sync form; card library display; promise creation and status controls; Apple Maps links; relationship metrics; local template or mock analysis; private draft visibility; service health; and LLM fallback status.

## Phase 5 iOS Native Slice

Create the SwiftUI native slice under `apps/ios/HeartSync`. The iOS app consumes backend DTOs and focuses on the native excellence surface rather than replacing the Web review client.

The slice includes Today, Promises, Review, and Us tabs, `APIClient`, `KeychainStore`, `RouteSnapshotService`, MapKit route snapshot support, fallback route covers, Apple Maps links, configured/unconfigured LLM settings, and XCTest coverage for state mapping, route fallback, and Keychain behavior.

## Phase 6 CI Docker Documentation

Add GitHub Actions CI, Docker Compose, backend and Web Dockerfiles, and final documentation. CI runs `npm run verify`. Docker Compose starts backend on `3000` and Web on `5173`, with a persistent SQLite volume for backend data.

Documentation includes root course files, setup instructions, Docker instructions, iOS run instructions, Web review URL, limitations, spec process, agent log, and reflection.

## Verification Commands

Run these commands during implementation and final review:

```bash
npm install
npm --workspace apps/backend run test -- tests/domain
npm --workspace apps/backend run test -- tests/api/core-flow.test.ts
npm run build:web
npm run verify
docker compose config
test -f SPEC.md && test -f PLAN.md && test -f SPEC_PROCESS.md && test -f AGENT_LOG.md && test -f REFLECTION.md && test -f README.md
```

When an iOS project is available locally, run the iOS test command from Xcode or the terminal with an available simulator:

```bash
xcodebuild test -scheme HeartSync -destination 'platform=iOS Simulator,name=iPhone 16'
```
