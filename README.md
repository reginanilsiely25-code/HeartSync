# HeartSync

HeartSync is an iOS-first relationship app for couples who want a lightweight daily ritual, shared sync cards, promise planning, and gentle relationship rhythm review. The project includes a Node.js/TypeScript backend, SQLite/Prisma data model, React/Vite Web review client, SwiftUI iOS native slice, CI, Docker distribution, and course documentation.

## Project Structure

```text
.
├── apps/backend
├── apps/web
├── apps/ios/HeartSync
├── docs/superpowers/specs/2026-07-08-heartsync-design.md
├── docs/superpowers/plans/2026-08-13-heartsync-implementation.md
├── SPEC.md
├── PLAN.md
├── SPEC_PROCESS.md
├── AGENT_LOG.md
└── REFLECTION.md
```

## Local Development

Install dependencies from the repository root:

```bash
npm install
```

Run backend tests and Web build together:

```bash
npm run verify
```

Start the backend:

```bash
npm run dev:backend
```

Start the Web review client:

```bash
npm run dev:web
```

The backend health endpoint is `http://localhost:3000/health`.

## Web Review URL

Open the Web review client at:

```text
http://localhost:5173
```

Use the Web flow to reset demo data, switch between demo users, submit daily syncs, create or update promises, and generate relationship reviews.

## Docker

Validate Docker Compose configuration:

```bash
docker compose config
```

Run backend and Web together:

```bash
docker compose up --build
```

Docker exposes:

- Backend: `http://localhost:3000`
- Web: `http://localhost:5173`

The Compose setup uses a Docker volume for SQLite backend data.

## iOS Run Instructions

Open the iOS source in Xcode from:

```text
apps/ios/HeartSync
```

Select the `HeartSync` scheme and run on an available iOS simulator or device. The iOS app expects the backend to be running locally. For simulator testing, use the local backend URL configured in the iOS API client.

When the Xcode project and simulator are available, run tests with:

```bash
xcodebuild test -scheme HeartSync -destination 'platform=iOS Simulator,name=iPhone 16'
```

If that simulator is not installed, choose an available iOS simulator in Xcode and record the exact destination used.

## Credentials

The Core MVP does not require a real LLM key. Template and mock LLM-shaped analysis work locally.

For the optional AI/Polish Track, iOS stores an OpenAI-compatible API key in Keychain, sends it only for the current request, and never displays the raw value. The backend must not persist or log provider keys.

## Limitations

- Device-bound identity is for MVP review only.
- Web is a bounded desktop review client, not a full iOS-equivalent client.
- Core MVP uses local template and mock LLM analysis.
- Real LLM provider calls are part of the AI/Polish Track.
- iOS is distributed as source with simulator instructions, not App Store or TestFlight.
- The app does not provide therapy, diagnosis, blame assignment, breakup advice, realtime location, route tracking, full navigation, or automatic sending of generated messages.
