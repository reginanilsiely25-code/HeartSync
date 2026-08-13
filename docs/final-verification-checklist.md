# HeartSync Final Verification Checklist

Status: DONE_WITH_CONCERNS

This worktree does not currently contain the HeartSync application code from Tasks 1-7. The required final verification commands cannot be treated as passing until the monorepo scaffold, backend, Web app, Docker Compose file, and supporting implementation files are present in this worktree.

## Required Command Verification

- [ ] `npm run verify`
  - Current result: blocked. The target worktree is missing the expected root verification script/app scaffold.
- [ ] `docker compose config`
  - Current result: blocked. Docker is not available in the current shell, and the target worktree is missing `docker-compose.yml`.
- [ ] `npm run dev:backend`
  - Current result: blocked. The target worktree is missing the expected backend dev script/app scaffold.
- [ ] `npm run dev:web`
  - Current result: blocked. The target worktree is missing the expected Web app scaffold for a valid Task 8 run.
- [ ] Confirm backend `/health` at `http://localhost:3000/health`
  - Current result: not run because the backend cannot be started from this worktree.
- [ ] Confirm Web at `http://localhost:5173/`
  - Current result: not run because the Web app cannot be started from this worktree.

## Manual Review Flow

Run this flow after Tasks 1-7 are present and the backend and Web dev servers are running:

1. Reset demo.
2. Switch acting user.
3. Submit a `partner_visible` daily sync.
4. Submit a `private` daily sync as the other user.
5. Create a promise with route coordinates.
6. Postpone the promise with a new date.
7. Generate a review.
8. Confirm private note text is not visible in shared analysis.
9. Confirm unsafe mock output falls back to local template when configured in test mode.

## Known Limitations

Known limitations:
- Device-bound identity is for MVP review only.
- Web is a bounded desktop review client, not a full iOS-equivalent client.
- Core MVP uses local template and mock LLM analysis.
- Real LLM provider calls are part of the AI/Polish Track.
- iOS is distributed as source with simulator instructions, not App Store/TestFlight.

## Missing Dependencies Before Green Verification

- Root `package.json` with `verify`, `dev:backend`, and `dev:web` scripts.
- `package-lock.json` generated from the HeartSync workspaces.
- `docker-compose.yml`.
- `apps/backend` Fastify/Prisma implementation and tests.
- `apps/web` Vite/React review client.
- `apps/ios` SwiftUI source slice.
- README/course documentation updates from earlier tasks.
