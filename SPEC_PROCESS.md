# HeartSync Spec Process

## Human Brainstorming

The project began with human brainstorming around a couple relationship app that should feel meaningful, polished, and complex enough for an AI4SE Final Project B submission. The human owner steered the idea toward an iOS-first experience while also requiring a Web path that reviewers could run quickly.

- The human owner chose a couple relationship app as the domain.
- The human owner requested a more complex project with native iOS and Web.
- The product language was reviewed to keep the app gentle, reflective, and non-diagnostic.

## SCOPE/REQ/AC Review

The spec was reviewed using explicit scope, requirements, and acceptance criteria checks. The goal was to make the work ambitious while still reviewable.

- SCOPE-1 through SCOPE-3 were revised to keep the Core MVP reviewable.
- REQ-1 through REQ-6 were revised to make maps, privacy, notes, unsafe AI output, pairing, and postponement deterministic.
- AC-1 through AC-3 were revised to make formulas, performance, and CI measurable.

## Staged Scope Split

The approved design splits work into three tracks:

- Core MVP: backend, database, Web review flow, shared sync cards, daily sync, promise planning, review metrics, local template reports, tests, CI, Docker, and README.
- iOS Excellence Track: SwiftUI Today, Promises, Review, and Us tabs, Keychain settings, and MapKit route snapshot integration.
- AI/Polish Track: optional real OpenAI-compatible provider calls, richer animation polish, and expanded analysis.

This split keeps the Web and backend reviewable even if native polish or real LLM integration takes longer.

## Approved Decisions

The approved product and engineering decisions are:

- Use an iOS-first product model with a bounded Web review client.
- Use Node.js 20, TypeScript, Fastify, Prisma, SQLite, Vitest, React, Vite, SwiftUI, XCTest, MapKit, Docker Compose, and GitHub Actions.
- Keep device-bound identity for MVP review rather than building password or email accounts.
- Use 6-character uppercase pairing codes that exclude `0`, `O`, `1`, and `I`, expire after 24 hours, and reject full or conflicting couples.
- Treat `private` daily syncs as aggregate metric inputs while hiding partner-facing detail and excluding note text from shared reports.
- Store route place text and optional coordinates, but do not perform backend geocoding, realtime location, route tracking, or navigation state.
- Use local templates and mock LLM-shaped output for the Core MVP, with real provider calls as optional excellence work.
- Reject unsafe generated output and return local template fallback instead of exposing unsafe text.
