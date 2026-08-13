# HeartSync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the HeartSync Core MVP plus the minimum iOS Excellence slice: a tested Fastify/Prisma backend, a warm React Web review flow, a SwiftUI iOS native slice with MapKit route cards, CI, Docker distribution, and course-ready documentation.

**Architecture:** Use a monorepo with `apps/backend`, `apps/web`, and `apps/ios`. The backend owns all data validation, metrics, privacy rules, LLM template/mock behavior, and demo reset logic. Web is the bounded review client; iOS is the native product slice that consumes the same backend APIs and implements MapKit/Keychain abstractions behind testable services.

**Tech Stack:** Node.js 20, TypeScript, Fastify, Prisma, SQLite, Vitest, React, Vite, SwiftUI, XCTest, MapKit, Docker Compose, GitHub Actions.

## Global Constraints

- Project type is AI4SE Final Project B, non-harness application project.
- Core MVP includes backend, database, Web review flow, shared sync cards, daily sync, promise planning, review metrics, local template reports, tests, CI, Docker, and README.
- iOS Excellence Track minimum slice includes Today, Promises route cover, Review rendering, Us settings, Keychain storage, and MapKit route snapshot integration.
- Web is a bounded desktop review experience, not an iOS-equivalent second client.
- Core MVP uses local templates and a mock LLM provider; real provider calls must not block Core MVP.
- Real API keys must never be committed.
- Web demo must not accept or store real LLM API keys in MVP.
- No realtime location, route tracking, full navigation, full chat history upload, psychological diagnosis, blame, breakup advice, or automatic sending of AI-generated messages.
- Pairing codes are 6-character uppercase alphanumeric strings excluding `0`, `O`, `1`, and `I`; codes expire after 24 hours.
- Daily sync visibility is exactly `partner_visible` or `private`.
- `npm run verify` must run backend tests plus Web build.
- CI must run `npm run verify`.

---

## File Structure

Create this structure:

```text
.
├── SPEC.md
├── PLAN.md
├── SPEC_PROCESS.md
├── AGENT_LOG.md
├── REFLECTION.md
├── README.md
├── package.json
├── package-lock.json
├── docker-compose.yml
├── .github/workflows/ci.yml
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/schema.prisma
│   │   ├── src/app.ts
│   │   ├── src/server.ts
│   │   ├── src/config.ts
│   │   ├── src/db/prisma.ts
│   │   ├── src/domain/pairing.ts
│   │   ├── src/domain/metrics.ts
│   │   ├── src/domain/notes.ts
│   │   ├── src/domain/safety.ts
│   │   ├── src/domain/templates.ts
│   │   ├── src/domain/demoData.ts
│   │   ├── src/routes/users.ts
│   │   ├── src/routes/couples.ts
│   │   ├── src/routes/syncCards.ts
│   │   ├── src/routes/dailySyncs.ts
│   │   ├── src/routes/plans.ts
│   │   ├── src/routes/insights.ts
│   │   ├── src/routes/demo.ts
│   │   └── tests/
│   │       ├── domain/pairing.test.ts
│   │       ├── domain/metrics.test.ts
│   │       ├── domain/notes.test.ts
│   │       ├── domain/safety.test.ts
│   │       └── api/core-flow.test.ts
│   ├── web/
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── src/main.tsx
│   │   ├── src/App.tsx
│   │   ├── src/api/client.ts
│   │   ├── src/state/demoSession.ts
│   │   ├── src/styles/tokens.css
│   │   ├── src/components/AppShell.tsx
│   │   ├── src/components/TodayView.tsx
│   │   ├── src/components/PromisesView.tsx
│   │   ├── src/components/ReviewView.tsx
│   │   └── src/components/UsView.tsx
│   └── ios/
│       └── HeartSync/
│           ├── HeartSyncApp.swift
│           ├── Models.swift
│           ├── APIClient.swift
│           ├── KeychainStore.swift
│           ├── RouteSnapshotService.swift
│           ├── ContentView.swift
│           ├── TodayView.swift
│           ├── PromisesView.swift
│           ├── ReviewView.swift
│           ├── UsView.swift
│           └── HeartSyncTests/
│               ├── TodayViewModelTests.swift
│               ├── RouteSnapshotServiceTests.swift
│               └── KeychainStoreTests.swift
└── docs/superpowers/
    ├── specs/2026-07-08-heartsync-design.md
    └── plans/2026-08-13-heartsync-implementation.md
```

## Task 1: Monorepo Scripts and Baseline Project Skeleton

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/vite.config.ts`

**Interfaces:**
- Produces root commands: `npm run test`, `npm run build:web`, `npm run verify`, `npm run dev:backend`, `npm run dev:web`.
- Produces app workspaces: `apps/backend`, `apps/web`.

- [ ] **Step 1: Create root package scripts**

Write `package.json`:

```json
{
  "name": "heartsync",
  "private": true,
  "workspaces": ["apps/backend", "apps/web"],
  "scripts": {
    "test": "npm --workspace apps/backend run test",
    "build:web": "npm --workspace apps/web run build",
    "verify": "npm run test && npm run build:web",
    "dev:backend": "npm --workspace apps/backend run dev",
    "dev:web": "npm --workspace apps/web run dev"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create ignore rules**

Write `.gitignore`:

```gitignore
.superpowers/
node_modules/
dist/
.env
.env.*
*.sqlite
*.sqlite-journal
DerivedData/
.DS_Store
```

- [ ] **Step 3: Create backend package files**

Write `apps/backend/package.json`:

```json
{
  "name": "@heartsync/backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@prisma/client": "^5.22.0",
    "fastify": "^4.28.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "prisma": "^5.22.0",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

Write `apps/backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Create Web package files**

Write `apps/web/package.json`:

```json
{
  "name": "@heartsync/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.11",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.6.3"
  }
}
```

Write `apps/web/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HeartSync</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `apps/web/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 6: Verify baseline scripts exist**

Run: `npm run verify`

Expected: It may fail before backend tests and Web source exist. The failure must mention missing source/config, not invalid JSON or missing npm scripts.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json .gitignore apps/backend/package.json apps/backend/tsconfig.json apps/web/package.json apps/web/index.html apps/web/vite.config.ts
git commit -m "chore: scaffold HeartSync monorepo"
```

Expected: Commit succeeds.

## Task 2: Backend Prisma Schema and Domain Rules

**Files:**
- Create: `apps/backend/prisma/schema.prisma`
- Create: `apps/backend/src/domain/pairing.ts`
- Create: `apps/backend/src/domain/metrics.ts`
- Create: `apps/backend/src/domain/notes.ts`
- Create: `apps/backend/src/domain/safety.ts`
- Create: `apps/backend/src/domain/templates.ts`
- Test: `apps/backend/tests/domain/pairing.test.ts`
- Test: `apps/backend/tests/domain/metrics.test.ts`
- Test: `apps/backend/tests/domain/notes.test.ts`
- Test: `apps/backend/tests/domain/safety.test.ts`

**Interfaces:**
- Produces `generatePairingCode(randomInt?: (max: number) => number): string`.
- Produces `normalizePairingCode(input: string): string`.
- Produces `calculateMetrics(input: MetricsInput): MetricsReport`.
- Produces `selectNotes(input: NoteSelectionInput): SelectedNotes`.
- Produces `detectUnsafeAnalysis(output: AnalysisOutput): UnsafeCategory[]`.
- Produces `buildTemplateAnalysis(input: TemplateInput): AnalysisOutput`.

- [ ] **Step 1: Write pairing tests**

Create `apps/backend/tests/domain/pairing.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generatePairingCode, normalizePairingCode } from "../../src/domain/pairing";

describe("pairing code rules", () => {
  it("generates 6 uppercase non-ambiguous characters", () => {
    const code = generatePairingCode(() => 0);
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
    expect(code).not.toMatch(/[0O1I]/);
  });

  it("normalizes whitespace and casing", () => {
    expect(normalizePairingCode(" ab2cd3 ")).toBe("AB2CD3");
  });
});
```

- [ ] **Step 2: Implement pairing domain**

Create `apps/backend/src/domain/pairing.ts`:

```ts
const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePairingCode(randomInt: (max: number) => number = (max) => Math.floor(Math.random() * max)): string {
  return Array.from({ length: 6 }, () => PAIRING_ALPHABET[randomInt(PAIRING_ALPHABET.length)]).join("");
}

export function normalizePairingCode(input: string): string {
  return input.trim().toUpperCase();
}

export function pairingCodeExpiresAt(now: Date): Date {
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}
```

- [ ] **Step 3: Write metrics tests**

Create `apps/backend/tests/domain/metrics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateMetrics } from "../../src/domain/metrics";

describe("relationship metrics", () => {
  it("calculates relationship temperature from component scores", () => {
    const report = calculateMetrics({
      periodStart: "2026-08-01",
      periodEnd: "2026-08-07",
      dailySyncs: [
        { userId: "u1", syncDate: "2026-08-01", moodScore: 4, energyScore: 4, longingScore: 3, visibility: "partner_visible" },
        { userId: "u2", syncDate: "2026-08-01", moodScore: 3, energyScore: 3, longingScore: 3, visibility: "partner_visible" },
        { userId: "u1", syncDate: "2026-08-02", moodScore: 5, energyScore: 4, longingScore: 3, visibility: "partner_visible" },
        { userId: "u2", syncDate: "2026-08-02", moodScore: 4, energyScore: 4, longingScore: 3, visibility: "private" }
      ],
      plans: [
        { status: "completed" },
        { status: "postponed" }
      ],
      expectedSyncSlots: 14
    });

    expect(report.syncRate).toBe(29);
    expect(report.sharedProgressScore).toBe(50);
    expect(report.relationshipTemperature).toBeGreaterThanOrEqual(49);
    expect(report.relationshipTemperature).toBeLessThanOrEqual(51);
  });

  it("marks trend claims insufficient when there are fewer than 3 daily syncs", () => {
    const report = calculateMetrics({
      periodStart: "2026-08-01",
      periodEnd: "2026-08-07",
      dailySyncs: [
        { userId: "u1", syncDate: "2026-08-01", moodScore: 4, energyScore: 4, longingScore: 3, visibility: "partner_visible" }
      ],
      plans: [],
      expectedSyncSlots: 14
    });

    expect(report.insufficientData).toBe(true);
    expect(report.trendSummary).toBe("insufficient data");
  });
});
```

- [ ] **Step 4: Implement metrics domain**

Create `apps/backend/src/domain/metrics.ts`:

```ts
export type DailySyncMetric = {
  userId: string;
  syncDate: string;
  moodScore: number;
  energyScore: number;
  longingScore: number;
  visibility: "partner_visible" | "private";
};

export type PlanMetric = { status: "not_started" | "in_progress" | "completed" | "postponed" | "overdue" };

export type MetricsInput = {
  periodStart: string;
  periodEnd: string;
  dailySyncs: DailySyncMetric[];
  plans: PlanMetric[];
  expectedSyncSlots: number;
};

export type MetricsReport = {
  syncRate: number;
  averageMood: number | null;
  averageEnergy: number | null;
  averageLonging: number | null;
  lowMoodDays: number;
  completedPromises: number;
  postponedPromises: number;
  syncStabilityScore: number;
  emotionalTrendScore: number;
  sharedProgressScore: number;
  relationshipTemperature: number;
  insufficientData: boolean;
  trendSummary: string;
};

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateMetrics(input: MetricsInput): MetricsReport {
  const syncRate = input.expectedSyncSlots === 0 ? 0 : Math.round((input.dailySyncs.length / input.expectedSyncSlots) * 100);
  const completedPromises = input.plans.filter((plan) => plan.status === "completed").length;
  const postponedPromises = input.plans.filter((plan) => plan.status === "postponed").length;
  const overduePromises = input.plans.filter((plan) => plan.status === "overdue").length;
  const promiseDenominator = completedPromises + postponedPromises + overduePromises;
  const sharedProgressScore = promiseDenominator === 0 ? 70 : Math.round((completedPromises / promiseDenominator) * 100);
  const insufficientData = input.dailySyncs.length < 3;
  const emotionalTrendScore = insufficientData ? 70 : 100;
  const relationshipTemperature = Math.round(syncRate * 0.35 + emotionalTrendScore * 0.35 + sharedProgressScore * 0.3);

  return {
    syncRate,
    averageMood: average(input.dailySyncs.map((sync) => sync.moodScore)),
    averageEnergy: average(input.dailySyncs.map((sync) => sync.energyScore)),
    averageLonging: average(input.dailySyncs.map((sync) => sync.longingScore)),
    lowMoodDays: input.dailySyncs.filter((sync) => sync.moodScore <= 2).length,
    completedPromises,
    postponedPromises,
    syncStabilityScore: clampScore(syncRate),
    emotionalTrendScore,
    sharedProgressScore,
    relationshipTemperature,
    insufficientData,
    trendSummary: insufficientData ? "insufficient data" : "trend available"
  };
}
```

- [ ] **Step 5: Write note selection and safety tests**

Create `apps/backend/tests/domain/notes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { selectNotes } from "../../src/domain/notes";

describe("note selection", () => {
  const notes = [
    { id: "old", userId: "u1", syncDate: "2026-08-01", note: "old visible", visibility: "partner_visible" as const },
    { id: "selected", userId: "u1", syncDate: "2026-08-02", note: "selected", visibility: "partner_visible" as const },
    { id: "latest", userId: "u2", syncDate: "2026-08-03", note: "latest visible", visibility: "partner_visible" as const },
    { id: "private", userId: "u1", syncDate: "2026-08-04", note: "private latest", visibility: "private" as const }
  ];

  it("prefers explicitly selected partner-visible notes", () => {
    const selected = selectNotes({
      notes,
      selectedNoteIds: ["selected"],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).toEqual(["selected"]);
  });

  it("uses latest 3 partner-visible notes when no explicit selection exists", () => {
    const selected = selectNotes({
      notes,
      selectedNoteIds: [],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).toEqual(["latest visible", "selected", "old visible"]);
  });

  it("excludes private notes from shared inputs and allows latest current-user private note for private draft", () => {
    const selected = selectNotes({
      notes,
      selectedNoteIds: [],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes).not.toContain("private latest");
    expect(selected.privateDraftNotes).toEqual(["private latest"]);
  });

  it("truncates selected notes to 120 characters", () => {
    const longNote = "x".repeat(140);
    const selected = selectNotes({
      notes: [{ id: "long", userId: "u1", syncDate: "2026-08-05", note: longNote, visibility: "partner_visible" }],
      selectedNoteIds: ["long"],
      currentUserId: "u1"
    });

    expect(selected.sharedNotes[0]).toHaveLength(120);
  });
});
```

Create `apps/backend/tests/domain/safety.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { detectUnsafeAnalysis } from "../../src/domain/safety";

describe("unsafe analysis detection", () => {
  it("detects breakup advice and discards provider output later in the route layer", () => {
    const output = {
      sharedSummary: "You should break up with them tonight.",
      trendExplanation: "This is a hard week.",
      suggestions: ["Threaten breakup if they do not change."],
      privateMessageDraft: "I want to talk carefully.",
      riskFlags: []
    };

    expect(detectUnsafeAnalysis(output)).toEqual(["breakup_advice"]);
  });

  it("detects all unsafe categories", () => {
    const output = {
      sharedSummary: "They have a personality disorder and everything is their fault.",
      trendExplanation: "Use jealousy and silent treatment to control them.",
      suggestions: [
        "Upload your full chat history and secretly access their account.",
        "Track their realtime location history.",
        "Threaten violence or self-harm."
      ],
      privateMessageDraft: "You should break up as leverage.",
      riskFlags: []
    };

    expect(detectUnsafeAnalysis(output)).toEqual([
      "diagnosis",
      "blame",
      "breakup_advice",
      "manipulation",
      "privacy_violation",
      "location_tracking",
      "self_harm_or_violence"
    ]);
  });
});
```

- [ ] **Step 6: Implement note and safety domains**

Create `apps/backend/src/domain/notes.ts`:

```ts
export type SelectableNote = {
  id: string;
  userId: string;
  syncDate: string;
  note: string;
  visibility: "partner_visible" | "private";
};

export type NoteSelectionInput = {
  notes: SelectableNote[];
  selectedNoteIds: string[];
  currentUserId: string;
};

export type SelectedNotes = {
  sharedNotes: string[];
  privateDraftNotes: string[];
};

function truncateNote(note: string): string {
  return note.slice(0, 120);
}

function newestFirst(a: SelectableNote, b: SelectableNote): number {
  return b.syncDate.localeCompare(a.syncDate);
}

export function selectNotes(input: NoteSelectionInput): SelectedNotes {
  const visibleNotes = input.notes.filter((note) => note.visibility === "partner_visible");
  const selectedVisibleNotes = input.selectedNoteIds
    .map((id) => visibleNotes.find((note) => note.id === id))
    .filter((note): note is SelectableNote => Boolean(note));

  const sharedSource = selectedVisibleNotes.length > 0
    ? selectedVisibleNotes
    : [...visibleNotes].sort(newestFirst);

  const privateDraftNote = [...input.notes]
    .filter((note) => note.visibility === "private" && note.userId === input.currentUserId)
    .sort(newestFirst)
    .slice(0, 1)
    .map((note) => truncateNote(note.note));

  return {
    sharedNotes: sharedSource.slice(0, 3).map((note) => truncateNote(note.note)),
    privateDraftNotes: privateDraftNote
  };
}
```

Create `apps/backend/src/domain/safety.ts`:

```ts
export type UnsafeCategory =
  | "diagnosis"
  | "blame"
  | "breakup_advice"
  | "manipulation"
  | "privacy_violation"
  | "location_tracking"
  | "self_harm_or_violence";

export type AnalysisOutput = {
  sharedSummary: string;
  trendExplanation: string;
  suggestions: string[];
  privateMessageDraft: string;
  riskFlags: UnsafeCategory[];
};

const RULES: Array<[UnsafeCategory, RegExp]> = [
  ["diagnosis", /diagnosis|personality disorder|attachment disorder|mental-health conclusion/i],
  ["blame", /their fault|your fault|everything is (his|her|their) fault/i],
  ["breakup_advice", /break up|breakup|threaten breakup|as leverage/i],
  ["manipulation", /guilt|jealousy|silent treatment|control them|coerc/i],
  ["privacy_violation", /full chat history|secretly access|private note exposure|partner's device|partner's account/i],
  ["location_tracking", /realtime location|location history|track their/i],
  ["self_harm_or_violence", /self-harm|violence|threaten violence|harm/i]
];

export function detectUnsafeAnalysis(output: AnalysisOutput): UnsafeCategory[] {
  const text = [
    output.sharedSummary,
    output.trendExplanation,
    ...output.suggestions,
    output.privateMessageDraft
  ].join("\n");

  return RULES
    .filter(([, pattern]) => pattern.test(text))
    .map(([category]) => category);
}
```

- [ ] **Step 7: Create Prisma schema**

Create `apps/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum DailySyncVisibility {
  partner_visible
  private
}

enum PlanType {
  date
  anniversary
  joint_task
}

enum PlanStatus {
  not_started
  in_progress
  completed
  postponed
}

model User {
  id           String         @id @default(cuid())
  deviceUserId String        @unique
  displayName  String
  avatarColor  String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  memberships  CoupleMember[]
  syncCards    SyncCard[]    @relation("CreatedSyncCards")
  dailySyncs   DailySync[]
  suggestions  PrivateSuggestion[]
}

model Couple {
  id                   String         @id @default(cuid())
  pairingCode          String         @unique
  pairingCodeExpiresAt DateTime
  startedAt            DateTime       @default(now())
  createdByUserId      String
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  members              CoupleMember[]
  syncCards            SyncCard[]
  dailySyncs           DailySync[]
  plans                Plan[]
  insightReports       InsightReport[]
}

model CoupleMember {
  coupleId String
  userId   String
  role     String
  joinedAt DateTime @default(now())
  couple   Couple   @relation(fields: [coupleId], references: [id])
  user     User     @relation(fields: [userId], references: [id])

  @@id([coupleId, userId])
}

model SyncCard {
  id                  String      @id @default(cuid())
  coupleId            String
  title               String
  emoji               String
  color               String
  tagsJson            String
  defaultMoodScore    Int
  defaultEnergyScore  Int
  defaultLongingScore Int
  isArchived          Boolean     @default(false)
  createdByUserId     String
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  couple              Couple      @relation(fields: [coupleId], references: [id])
  createdBy           User        @relation("CreatedSyncCards", fields: [createdByUserId], references: [id])
  dailySyncs          DailySync[]
}

model DailySync {
  id           String              @id @default(cuid())
  coupleId     String
  userId       String
  syncDate     DateTime
  cardId       String
  moodScore    Int
  energyScore  Int
  longingScore Int
  tagsJson     String
  note         String
  visibility   DailySyncVisibility @default(partner_visible)
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
  couple       Couple              @relation(fields: [coupleId], references: [id])
  user         User                @relation(fields: [userId], references: [id])
  card         SyncCard            @relation(fields: [cardId], references: [id])

  @@unique([userId, syncDate])
}

model Plan {
  id                   String     @id @default(cuid())
  coupleId             String
  title                String
  type                 PlanType
  scheduledAt          DateTime
  status               PlanStatus @default(not_started)
  ownerUserId          String
  completedAt          DateTime?
  postponedFrom        DateTime?
  postponeReason       String?
  startPlaceName       String
  startLatitude        Float?
  startLongitude       Float?
  destinationName      String
  destinationLatitude  Float?
  destinationLongitude Float?
  notes                String
  createdAt            DateTime   @default(now())
  updatedAt            DateTime   @updatedAt
  couple               Couple     @relation(fields: [coupleId], references: [id])
}

model InsightReport {
  id                  String              @id @default(cuid())
  coupleId            String
  periodType          String
  periodStart         DateTime
  periodEnd           DateTime
  temperatureScore    Int
  metricsJson         String
  templateSummary     String
  llmSharedSummary    String?
  llmTrendExplanation String?
  llmSuggestionsJson  String?
  generatedAt         DateTime            @default(now())
  couple              Couple              @relation(fields: [coupleId], references: [id])
  privateSuggestions  PrivateSuggestion[]

  @@unique([coupleId, periodType, periodStart, periodEnd])
}

model PrivateSuggestion {
  id           String        @id @default(cuid())
  reportId     String
  userId       String
  messageDraft String
  generatedAt  DateTime      @default(now())
  report       InsightReport @relation(fields: [reportId], references: [id])
  user         User          @relation(fields: [userId], references: [id])
}
```

- [ ] **Step 8: Verify domain tests**

Run: `npm --workspace apps/backend run test -- tests/domain`

Expected: all domain tests pass.

- [ ] **Step 9: Commit**

Run:

```bash
git add apps/backend/prisma apps/backend/src/domain apps/backend/tests/domain
git commit -m "feat: add HeartSync backend domain rules"
```

Expected: Commit succeeds.

## Task 3: Backend API and Demo Data

**Files:**
- Create: `apps/backend/src/app.ts`
- Create: `apps/backend/src/server.ts`
- Create: `apps/backend/src/config.ts`
- Create: `apps/backend/src/db/prisma.ts`
- Create: `apps/backend/src/domain/demoData.ts`
- Create/Modify: backend route files under `apps/backend/src/routes/`
- Test: `apps/backend/tests/api/core-flow.test.ts`

**Interfaces:**
- Produces Fastify app factory `buildApp(): FastifyInstance`.
- Produces `POST /demo/reset`.
- Produces all endpoints listed in the spec.
- Every couple-scoped endpoint consumes `X-Device-User-Id`.

- [ ] **Step 1: Write API flow test**

Create `apps/backend/tests/api/core-flow.test.ts` covering:

```ts
const alice = await app.inject({ method: "POST", url: "/users/device", payload: { deviceUserId: "alice-device", displayName: "Alice", avatarColor: "#E86A92" } });
const couple = await app.inject({ method: "POST", url: "/couples", headers: { "x-device-user-id": "alice-device" } });
const reset = await app.inject({ method: "POST", url: "/demo/reset" });
expect(alice.statusCode).toBe(200);
expect(couple.statusCode).toBe(200);
expect(reset.statusCode).toBe(200);
```

Extend the test in the same file to verify sync card CRUD, daily sync upsert, private visibility in `/today`, plan create/complete/postpone, insight generation, unsafe mock fallback, and `/health`.

- [ ] **Step 2: Implement Fastify app factory**

Create `apps/backend/src/app.ts`:

```ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerUserRoutes } from "./routes/users";
import { registerCoupleRoutes } from "./routes/couples";
import { registerSyncCardRoutes } from "./routes/syncCards";
import { registerDailySyncRoutes } from "./routes/dailySyncs";
import { registerPlanRoutes } from "./routes/plans";
import { registerInsightRoutes } from "./routes/insights";
import { registerDemoRoutes } from "./routes/demo";

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });
  app.get("/health", async () => ({ ok: true }));
  registerUserRoutes(app);
  registerCoupleRoutes(app);
  registerSyncCardRoutes(app);
  registerDailySyncRoutes(app);
  registerPlanRoutes(app);
  registerInsightRoutes(app);
  registerDemoRoutes(app);
  return app;
}
```

Create `apps/backend/src/server.ts`:

```ts
import { buildApp } from "./app";

const app = buildApp();
const port = Number(process.env.PORT ?? 3000);

await app.listen({ port, host: "0.0.0.0" });
```

- [ ] **Step 3: Implement routes with Zod validation**

For every route, validate payloads with `zod`. Return explicit error bodies:

```ts
{ "error": { "code": "invalid_input", "message": "moodScore must be 1-5" } }
```

Use these error codes: `invalid_input`, `not_found`, `forbidden`, `pairing_expired`, `couple_full`, `already_in_couple`, `unsafe_fallback`.

Implement this route behavior:

| Route | Required behavior |
| --- | --- |
| `POST /users/device` | Create or return user by `deviceUserId`; accept `displayName` and `avatarColor`. |
| `POST /couples` | Create couple for current device user, generate pairing code, add creator as member. |
| `POST /couples/join` | Normalize code, reject expired/full/already-in-couple cases, add second member. |
| `GET /couples/:coupleId/today` | Return both members and daily sync status; hide card/scores/tags/note for partner-visible response when sync is `private`. |
| `PUT /couples/:coupleId/daily-syncs/:date` | Upsert one sync per user/date; validate scores 1-5 and visibility enum. |
| `POST /plans/:planId/complete` | Set status `completed` and `completedAt` to now. |
| `POST /plans/:planId/postpone` | Require `newScheduledAt`; set `postponedFrom` to old `scheduledAt`, update `scheduledAt`, store optional `postponeReason`. |
| `POST /couples/:coupleId/insights/generate` | Calculate metrics, select notes, run template/mock provider, detect unsafe output, store report and private suggestions. |
| `POST /demo/reset` | Delete demo data and recreate deterministic seed data with `alice-device` and `bao-device`. |

- [ ] **Step 4: Implement demo reset**

Seed exactly:

```ts
const demoUsers = [
  { deviceUserId: "alice-device", displayName: "Alice", avatarColor: "#E86A92" },
  { deviceUserId: "bao-device", displayName: "Bao", avatarColor: "#5B8DEF" }
];

const demoCards = [
  { title: "想你爆炸", emoji: "💗", color: "#E86A92", tags: ["miss"], defaultMoodScore: 4, defaultEnergyScore: 3, defaultLongingScore: 5 },
  { title: "电量不足", emoji: "🔋", color: "#7C8797", tags: ["tired"], defaultMoodScore: 2, defaultEnergyScore: 1, defaultLongingScore: 3 },
  { title: "需要抱抱", emoji: "🫂", color: "#B779E8", tags: ["comfort"], defaultMoodScore: 3, defaultEnergyScore: 2, defaultLongingScore: 4 },
  { title: "今天发光", emoji: "✨", color: "#F0B84A", tags: ["bright"], defaultMoodScore: 5, defaultEnergyScore: 5, defaultLongingScore: 2 }
];
```

Seed 14 daily syncs across the last 7 dates. At least 2 seeded syncs must be `private`. Seed one completed plan, one postponed plan, and one route-enabled future date plan with all four coordinates.

- [ ] **Step 5: Verify API tests**

Run: `npm --workspace apps/backend run test -- tests/api/core-flow.test.ts`

Expected: all API tests pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/backend/src apps/backend/tests/api
git commit -m "feat: add HeartSync backend API"
```

Expected: Commit succeeds.

## Task 4: Web Review Experience

**Files:**
- Create: Web files under `apps/web/src/`
- Modify: `apps/web/package.json`

**Interfaces:**
- Consumes backend endpoints through `apps/web/src/api/client.ts`.
- Produces a desktop Web review flow with Today, Promises, Review, and Us views.

- [ ] **Step 1: Create API client**

Create `apps/web/src/api/client.ts` with typed functions for `resetDemo`, `getToday`, `listSyncCards`, `upsertDailySync`, `listPlans`, `createPlan`, `completePlan`, `postponePlan`, and `generateInsights`.

The client must set `X-Device-User-Id` on every couple-scoped request:

```ts
async function request<T>(path: string, options: RequestInit & { deviceUserId?: string } = {}): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.deviceUserId ? { "X-Device-User-Id": options.deviceUserId } : {}),
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}
```

- [ ] **Step 2: Create state and shell**

Create `apps/web/src/state/demoSession.ts` with `actingDeviceUserId` values `alice-device` and `bao-device`. Create `AppShell.tsx` with tab navigation and service status.

- [ ] **Step 3: Create Today view**

Implement card CRUD display, daily sync form, visibility toggle, and partner-visible/private state rendering.

The view must visibly include:

- acting user selector state from `demoSession`;
- card list with title, emoji, tags, and default scores;
- mood, energy, and longing controls constrained to 1-5;
- visibility segmented control with `partner_visible` and `private`;
- partner row showing synced-with-hidden-content for private syncs.

- [ ] **Step 4: Create Promises view**

Implement plan creation, manual start/destination text, optional coordinate inputs, complete/postpone controls, Apple Maps link, and fallback cover when coordinates are incomplete.

- [ ] **Step 5: Create Review view**

Implement relationship temperature, metrics cards, insufficient-data text, local template/mock sections, private draft visibility, unsafe fallback status, and note selection UI capped at 3 notes.

- [ ] **Step 6: Create Us view**

Implement acting-user switch, pair status, service health, demo reset, and LLM status as local template/mock fallback only.

- [ ] **Step 7: Style with HeartSync tokens**

Create `apps/web/src/styles/tokens.css` with warm but readable tokens, compact desktop layout, icon buttons using `lucide-react`, and non-overlapping responsive constraints.

- [ ] **Step 8: Verify Web build**

Run: `npm run build:web`

Expected: Vite build exits with code 0 and creates `apps/web/dist`.

- [ ] **Step 9: Commit**

Run:

```bash
git add apps/web
git commit -m "feat: add HeartSync web review flow"
```

Expected: Commit succeeds.

## Task 5: iOS Native Excellence Slice

**Files:**
- Create: Swift files under `apps/ios/HeartSync/`

**Interfaces:**
- Consumes backend API DTOs.
- Produces SwiftUI tabs: Today, Promises, Review, Us.
- Produces `RouteSnapshotService` and `KeychainStore` abstractions with test doubles.

- [ ] **Step 1: Create Swift models and API client**

Define `UserDTO`, `CoupleDTO`, `TodayDTO`, `PlanDTO`, `InsightDTO`, and `APIClient` methods matching backend endpoints.

Use these Swift enum raw values:

```swift
enum DailySyncVisibility: String, Codable {
    case partnerVisible = "partner_visible"
    case `private` = "private"
}

enum PlanStatus: String, Codable {
    case notStarted = "not_started"
    case inProgress = "in_progress"
    case completed
    case postponed
}
```

- [ ] **Step 2: Create SwiftUI tab shell**

Create `HeartSyncApp.swift` and `ContentView.swift` with tabs Today, Promises, Review, and Us.

- [ ] **Step 3: Implement Today native slice**

Show both members' sync status, card selection, score sliders from 1-5, note input, and visibility segmented control.

- [ ] **Step 4: Implement Promises native slice**

Show plan cards with title/date/status/fallback cover. Use `RouteSnapshotService` to request MapKit snapshot only when all four coordinates exist.

- [ ] **Step 5: Implement Review native slice**

Render backend metrics, relationship temperature, template/mock analysis, private draft, and unsafe fallback state.

- [ ] **Step 6: Implement Us/settings native slice**

Show profile, pairing state, service status, and Keychain-backed LLM settings UI with configured/unconfigured only.

- [ ] **Step 7: Add XCTest coverage**

Create tests for Today mapping, route snapshot fallback logic, and Keychain test double behavior.

- [ ] **Step 8: Verify iOS build and tests**

Run in Xcode or with `xcodebuild` after creating the Xcode project:

```bash
xcodebuild test -scheme HeartSync -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: app compiles and tests pass. If the simulator name differs, document the exact simulator used in `AGENT_LOG.md`.

- [ ] **Step 9: Commit**

Run:

```bash
git add apps/ios
git commit -m "feat: add HeartSync iOS native slice"
```

Expected: Commit succeeds.

## Task 6: CI, Docker, and Distribution

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `docker-compose.yml`
- Create: `apps/backend/Dockerfile`
- Create: `apps/web/Dockerfile`
- Modify: `README.md`

**Interfaces:**
- Produces Docker Compose review flow.
- Produces CI command `npm run verify`.

- [ ] **Step 1: Add CI**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run verify
```

- [ ] **Step 2: Add Docker Compose**

Create `docker-compose.yml` with backend on port `3000`, Web on port `5173`, and a bind-mounted SQLite data volume inside `apps/backend/prisma/dev.db`.

Use this service shape:

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_URL: file:/app/apps/backend/prisma/dev.db
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - backend-data:/app/apps/backend/prisma

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      VITE_API_BASE_URL: http://localhost:3000
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  backend-data:
```

- [ ] **Step 3: Add Dockerfiles**

Create backend and Web Dockerfiles that install dependencies, build, and start the appropriate server.

Create `apps/backend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY . .
RUN npm --workspace apps/backend run build
EXPOSE 3000
CMD ["npm", "--workspace", "apps/backend", "run", "dev"]
```

Create `apps/web/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY . .
RUN npm --workspace apps/web run build
EXPOSE 5173
CMD ["npm", "--workspace", "apps/web", "run", "preview", "--", "--host", "0.0.0.0"]
```

- [ ] **Step 4: Verify distribution config**

Run:

```bash
docker compose config
npm run verify
```

Expected: Docker config validates and `npm run verify` exits with code 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add .github docker-compose.yml apps/backend/Dockerfile apps/web/Dockerfile README.md
git commit -m "chore: add HeartSync CI and Docker distribution"
```

Expected: Commit succeeds.

## Task 7: Course Documentation

**Files:**
- Create: `SPEC.md`
- Create: `PLAN.md`
- Create: `SPEC_PROCESS.md`
- Create: `AGENT_LOG.md`
- Create: `REFLECTION.md`
- Modify: `README.md`

**Interfaces:**
- Produces final course-required documentation.
- References committed design spec and implementation plan.

- [ ] **Step 1: Write `SPEC.md`**

Summarize the product spec from `docs/superpowers/specs/2026-07-08-heartsync-design.md`, including Core MVP, iOS Excellence slice, data model, APIs, privacy, safety, testing, and acceptance criteria.

Use this heading structure:

```markdown
# HeartSync SPEC
## Project Type
## Problem Statement
## Core MVP Scope
## iOS Excellence Slice
## Explicit Non-Goals
## Data Model
## API Surface
## Privacy and Safety Rules
## Testing and Acceptance Criteria
```

- [ ] **Step 2: Write `PLAN.md`**

Summarize implementation phases from this plan, including task order, verification commands, and distribution flow.

Use this heading structure:

```markdown
# HeartSync PLAN
## Phase 1: Monorepo and Tooling
## Phase 2: Backend Domain Rules
## Phase 3: Backend API and Demo Data
## Phase 4: Web Review Flow
## Phase 5: iOS Native Slice
## Phase 6: CI, Docker, and Documentation
## Verification Commands
```

- [ ] **Step 3: Write `SPEC_PROCESS.md`**

Document the spec-driven process: user brainstorming, SCOPE/REQ/AC review, chosen scope split, and human-approved decisions.

Include these bullets:

```markdown
- The human owner chose a couple relationship app as the domain.
- The human owner requested a more complex project with native iOS and Web.
- The scope was split into Core MVP, iOS Excellence Track, and AI/Polish Track.
- SCOPE-1 through SCOPE-3 were revised to keep the Core MVP reviewable.
- REQ-1 through REQ-6 were revised to make maps, privacy, notes, unsafe AI output, pairing, and postponement deterministic.
- AC-1 through AC-3 were revised to make formulas, performance, and CI measurable.
```

- [ ] **Step 4: Write `AGENT_LOG.md`**

Log agent contributions by date: design creation, review fixes, implementation plan, scaffold, backend, Web, iOS, tests, CI, Docker, and docs.

Use a table with columns:

```markdown
| Date | Agent Action | Human Decision / Review | Files |
| --- | --- | --- | --- |
| 2026-07-08 | Drafted HeartSync design spec | Approved staged scope and feature choices | docs/superpowers/specs/2026-07-08-heartsync-design.md |
| 2026-08-13 | Wrote implementation plan | Pending execution choice | docs/superpowers/plans/2026-08-13-heartsync-implementation.md |
```

- [ ] **Step 5: Write `REFLECTION.md`**

Write a human-owned reflection covering what was delegated to AI, what was reviewed by the human, what changed during design, tradeoffs, limitations, and what would be improved next.

Use first person and include these sections:

```markdown
# Reflection
## What I Owned
## What I Delegated to AI
## Important Design Changes
## Tradeoffs
## Limitations
## What I Would Improve Next
```

- [ ] **Step 6: Verify docs are present**

Run:

```bash
test -f SPEC.md && test -f PLAN.md && test -f SPEC_PROCESS.md && test -f AGENT_LOG.md && test -f REFLECTION.md && test -f README.md
```

Expected: command exits with code 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add SPEC.md PLAN.md SPEC_PROCESS.md AGENT_LOG.md REFLECTION.md README.md
git commit -m "docs: add HeartSync course documentation"
```

Expected: Commit succeeds.

## Task 8: Final Verification and Review Handoff

**Files:**
- Modify only docs if verification reveals documentation gaps.

**Interfaces:**
- Produces final reviewer command list and known limitations.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm run verify
docker compose config
```

Expected: both commands exit with code 0.

- [ ] **Step 2: Run local demo**

Run:

```bash
npm run dev:backend
npm run dev:web
```

Expected: backend serves `/health` on `http://localhost:3000/health`; Web opens at `http://localhost:5173/`.

- [ ] **Step 3: Manual review flow**

In Web:

1. Click reset demo.
2. Switch acting user.
3. Submit a `partner_visible` daily sync.
4. Submit a `private` daily sync as the other user.
5. Create a promise with route coordinates.
6. Postpone the promise with a new date.
7. Generate a review.
8. Confirm private note text is not visible in shared analysis.
9. Confirm unsafe mock output falls back to local template when configured in test mode.

- [ ] **Step 4: Document limitations**

Update `README.md` with exact known limitations:

```markdown
Known limitations:
- Device-bound identity is for MVP review only.
- Web is a bounded desktop review client, not a full iOS-equivalent client.
- Core MVP uses local template and mock LLM analysis.
- Real LLM provider calls are part of the AI/Polish Track.
- iOS is distributed as source with simulator instructions, not App Store/TestFlight.
```

- [ ] **Step 5: Final commit**

Run:

```bash
git add README.md
git commit -m "docs: document HeartSync final verification"
```

Expected: Commit succeeds if README changed; skip the commit if `git status --short` is empty.

## Self-Review

Spec coverage:

- Device-bound user identity is covered by Tasks 2, 3, 5, and 7.
- Couple pairing and deterministic pairing-code rules are covered by Tasks 2 and 3.
- Shared sync card library is covered by Tasks 3 and 4.
- Daily sync visibility and private-note behavior are covered by Tasks 2, 3, 4, and 5.
- Promise planning, completion, postponement, and route coordinates are covered by Tasks 2, 3, 4, and 5.
- Review metrics, insufficient data behavior, and relationship temperature are covered by Tasks 2, 3, 4, and 5.
- Template/mock LLM analysis, note selection, unsafe fallback, and risk flags are covered by Tasks 2, 3, 4, and 5.
- Web bounded review flow is covered by Task 4.
- iOS native slice is covered by Task 5.
- CI, Docker, verification commands, README, and course docs are covered by Tasks 6, 7, and 8.

Placeholder scan:

- This plan uses no TBD/TODO placeholders.
- iOS Xcode project creation is explicit as a Task 5 prerequisite because Xcode generates workspace metadata locally; the required source files and tests are named.

Type consistency:

- Backend route, model, and domain names use the same names across tasks.
- `partner_visible`, `private`, `completedAt`, `postponedFrom`, `postponeReason`, `riskFlags`, and `relationshipTemperature` match the design spec.
