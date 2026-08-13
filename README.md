# HeartSync

HeartSync is an iOS-first relationship rhythm app with a companion Web review flow and a Node.js backend. The Core MVP is planned as a monorepo with `apps/backend`, `apps/web`, and `apps/ios`.

## Docker Compose

After the app scaffold is present, start the review stack from the repository root:

```bash
docker compose up --build
```

The Compose stack exposes:

- Backend API: `http://localhost:3000`
- Web review client: `http://localhost:5173`

The backend stores its SQLite database in the `backend-data` Docker volume at `/app/apps/backend/prisma/dev.db` with `DATABASE_URL=file:/app/apps/backend/prisma/dev.db`.

## Local Verification

CI and local verification use the same command:

```bash
npm run verify
```

The planned `verify` script runs backend tests and the Web build. GitHub Actions installs Node.js 20, runs `npm ci`, and then runs `npm run verify`.

## iOS Source Distribution

The iOS app is distributed as source for the Core MVP and course review. Reviewers should open the planned `apps/ios/HeartSync` source in Xcode and run it in the iOS simulator. HeartSync is not distributed through the App Store or TestFlight for the MVP.

## Known Limitations

- Device-bound identity is for MVP review only.
- Web is a bounded desktop review client, not a full iOS-equivalent client.
- Core MVP uses local template and mock LLM analysis.
- Real LLM provider calls are part of the AI/Polish Track.
- No real LLM API key is required, accepted, or committed for the Core MVP.
- The current Task 6 worktree contains distribution files only; the planned `package.json`, workspace package manifests, Prisma schema, backend source, Web source, and iOS source must be added by their implementation tasks before Docker image builds or `npm run verify` can pass.
