# HeartSync Submission

GitHub repository: https://github.com/reginanilsiely25-code/HeartSync

Online WebUI: https://reginanilsiely25-code.github.io/HeartSync/

## Materials Checklist

| Requirement | Submitted material |
| --- | --- |
| SPEC.md, PLAN.md, SPEC_PROCESS.md | `SPEC.md`, `PLAN.md`, `SPEC_PROCESS.md` |
| Complete source code and commit history | Repository source under `apps/backend`, `apps/web`, `apps/ios/HeartSync`; Git history on `main` |
| Distribution artifacts and instructions | `docker-compose.yml`, `apps/backend/Dockerfile`, `apps/web/Dockerfile`, `README.md` |
| README with setup, run, distribution, security boundaries | `README.md` |
| AGENT_LOG.md | `AGENT_LOG.md` |
| CI configuration with unit-test job | `.gitlab-ci.yml` with `unit-test`; `.github/workflows/ci.yml` also runs verification on GitHub |
| CI/CD execution record | GitHub Actions history in the repository Actions tab; local final verification checklist in `docs/final-verification-checklist.md` |
| REFLECTION.md | `REFLECTION.md` |
| WebUI entry | Online: `https://reginanilsiely25-code.github.io/HeartSync/`; local after running `npm run dev:web`: `http://localhost:5173` |

## Quick Verification

```bash
npm install
npm run verify
npm --workspace apps/backend run build
swiftc -parse apps/ios/HeartSync/*.swift apps/ios/HeartSync/HeartSyncTests/*.swift
```

## Notes

- The Core MVP does not require a real LLM key.
- The Web review client is a bounded course-review surface.
- The iOS native slice is submitted as SwiftUI source under `apps/ios/HeartSync`.
- Docker distribution is provided through Compose and per-app Dockerfiles.
