# Reflection

## What I Owned

I owned the product direction, final scope choices, and review criteria for HeartSync. I chose a couple relationship app because I wanted the project to combine emotional product design with concrete software engineering: native iOS, backend validation, privacy rules, Web review, metrics, maps, tests, CI, and Docker.

I also owned the final judgment about what belonged in the Core MVP and what should stay in an excellence track. That mattered because the idea could easily become too large for a course project.

## What I Delegated to AI

I delegated structured drafting and implementation planning to AI. AI helped turn the initial product idea into a formal spec, identify deterministic backend rules, split the work into phases, name files and interfaces, write acceptance criteria, and prepare course documentation.

I used AI as a software engineering collaborator, not as an unchecked replacement. The useful part was having AI make implicit requirements explicit, especially around privacy, pairing edge cases, note selection, unsafe generated text, and verification commands.

## Important Design Changes

The biggest design change was splitting the project into Core MVP, iOS Excellence Track, and AI/Polish Track. That kept the backend and Web review flow achievable while preserving the iOS-first product vision.

The Web app also changed from a possible admin or secondary app into a bounded desktop review client. It exists so reviewers can exercise the core workflow quickly, while iOS remains the native product slice.

The AI feature became safer and more testable. Instead of depending on real provider calls, the Core MVP uses local templates and mock LLM-shaped output. Real provider calls are optional and must respect Keychain storage, request-only key handling, structured output, safety filtering, and fallback behavior.

## Tradeoffs

I accepted device-bound identity because full accounts would add a lot of auth work without proving the main product idea. That tradeoff makes local review easier, but it is not production-grade identity.

I kept route data manual in the Core MVP. This avoids backend geocoding, realtime location, and navigation complexity, while still allowing iOS to show native MapKit route snapshots when coordinates are available.

I chose local templates and mock AI for the Core MVP. This lowers integration risk and avoids secret handling during review, but it makes the AI experience less impressive than a real provider-backed feature.

## Limitations

HeartSync is not a production relationship, health, or therapy product. Its metrics are reflective aids, not judgments. It does not diagnose people, assign blame, recommend breakup tactics, track realtime location, or send generated messages automatically.

The MVP identity model is tied to a device-generated identifier. Moving devices requires rejoining or a future account migration path.

The Web client is intentionally bounded for review. It does not replace the iOS app, does not use Keychain, does not render native MapKit snapshots, and does not accept real LLM keys in the MVP.

## What I Would Improve Next

Next, I would add a production account migration path, richer accessibility review, more complete iOS UI polish, better map place selection, cached route covers, notification reminders, and a careful real-provider AI path with provider-specific tests and clearer user consent.

I would also expand end-to-end tests around private sync visibility, unsafe fallback behavior, and the full reviewer journey from demo reset through insight generation.
