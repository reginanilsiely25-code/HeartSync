import type { DeviceUserId, PlanPayload, PlanStatus, SyncVisibility } from "../api/client";

export type DemoUser = {
  id: string;
  deviceUserId: DeviceUserId;
  displayName: string;
  avatarColor: string;
  role: "me" | "partner";
};

export type SyncCard = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  tags: string[];
  defaultMoodScore: number;
  defaultEnergyScore: number;
  defaultLongingScore: number;
};

export type DailySync = {
  id: string;
  userDeviceUserId: DeviceUserId;
  syncDate: string;
  cardId: string;
  moodScore: number;
  energyScore: number;
  longingScore: number;
  note: string;
  visibility: SyncVisibility;
  updatedAt: string;
};

export type PromisePlan = PlanPayload & {
  id: string;
  status: PlanStatus;
  completedAt?: string;
  postponedFrom?: string;
  postponeReason?: string;
};

export type DemoState = {
  coupleId: string;
  pairingCode: string;
  serviceStatus: "local-demo" | "backend-ready";
  llmStatus: "local-template" | "mock-fallback";
  users: DemoUser[];
  syncCards: SyncCard[];
  dailySyncs: DailySync[];
  plans: PromisePlan[];
};

export type Metrics = {
  syncRate: number;
  averageMood: number | null;
  averageEnergy: number | null;
  averageLonging: number | null;
  lowMoodDays: number;
  completedPromises: number;
  postponedPromises: number;
  relationshipTemperature: number;
  insufficientData: boolean;
};

export const actingDeviceUserIds: DeviceUserId[] = ["alice-device", "bao-device"];

const today = "2026-08-13";

export function createInitialDemoState(): DemoState {
  return {
    coupleId: "demo-couple",
    pairingCode: "HRT526",
    serviceStatus: "local-demo",
    llmStatus: "mock-fallback",
    users: [
      { id: "alice", deviceUserId: "alice-device", displayName: "Alice", avatarColor: "#d96f66", role: "me" },
      { id: "bao", deviceUserId: "bao-device", displayName: "Bao", avatarColor: "#3f8f88", role: "partner" }
    ],
    syncCards: [
      {
        id: "card-miss-you",
        title: "Missing you loudly",
        emoji: "💌",
        color: "#f2a6a0",
        tags: ["longing", "soft"],
        defaultMoodScore: 4,
        defaultEnergyScore: 3,
        defaultLongingScore: 5
      },
      {
        id: "card-low-battery",
        title: "Low battery",
        emoji: "🪫",
        color: "#c2b8a6",
        tags: ["tired", "quiet"],
        defaultMoodScore: 3,
        defaultEnergyScore: 2,
        defaultLongingScore: 4
      },
      {
        id: "card-need-hug",
        title: "Need a hug",
        emoji: "🤍",
        color: "#b7c7e8",
        tags: ["care", "comfort"],
        defaultMoodScore: 3,
        defaultEnergyScore: 3,
        defaultLongingScore: 5
      },
      {
        id: "card-glowing",
        title: "Glowing today",
        emoji: "✨",
        color: "#f1c65b",
        tags: ["bright", "good-news"],
        defaultMoodScore: 5,
        defaultEnergyScore: 4,
        defaultLongingScore: 2
      }
    ],
    dailySyncs: [
      {
        id: "sync-alice-today",
        userDeviceUserId: "alice-device",
        syncDate: today,
        cardId: "card-glowing",
        moodScore: 5,
        energyScore: 4,
        longingScore: 3,
        note: "Finished the hard thing and saved a quiet evening for us.",
        visibility: "partner_visible",
        updatedAt: "2026-08-13T09:10:00.000Z"
      },
      {
        id: "sync-bao-today",
        userDeviceUserId: "bao-device",
        syncDate: today,
        cardId: "card-low-battery",
        moodScore: 3,
        energyScore: 2,
        longingScore: 4,
        note: "Private recharge note for later.",
        visibility: "private",
        updatedAt: "2026-08-13T09:30:00.000Z"
      },
      {
        id: "sync-alice-prev",
        userDeviceUserId: "alice-device",
        syncDate: "2026-08-12",
        cardId: "card-need-hug",
        moodScore: 3,
        energyScore: 3,
        longingScore: 5,
        note: "A short call helped more than I expected.",
        visibility: "partner_visible",
        updatedAt: "2026-08-12T13:00:00.000Z"
      },
      {
        id: "sync-bao-prev",
        userDeviceUserId: "bao-device",
        syncDate: "2026-08-12",
        cardId: "card-miss-you",
        moodScore: 4,
        energyScore: 3,
        longingScore: 5,
        note: "Picked a weekend place; want your vote.",
        visibility: "partner_visible",
        updatedAt: "2026-08-12T13:10:00.000Z"
      }
    ],
    plans: [
      {
        id: "plan-river",
        title: "Saturday river walk",
        type: "date",
        scheduledAt: "2026-08-15T17:00",
        ownerDeviceUserId: "alice-device",
        startPlaceText: "Shanghai Library",
        destinationText: "West Bund",
        startLatitude: 31.2072,
        startLongitude: 121.444,
        destinationLatitude: 31.185,
        destinationLongitude: 121.4648,
        notes: "Bring tea and pick a bench before sunset.",
        status: "in_progress"
      },
      {
        id: "plan-call",
        title: "Anniversary photo call",
        type: "anniversary",
        scheduledAt: "2026-08-18T20:30",
        ownerDeviceUserId: "bao-device",
        startPlaceText: "Home",
        destinationText: "Video room",
        notes: "No coordinates needed for this one.",
        status: "not_started"
      },
      {
        id: "plan-done",
        title: "Book September tickets",
        type: "joint_task",
        scheduledAt: "2026-08-10T19:00",
        ownerDeviceUserId: "alice-device",
        startPlaceText: "Alice desk",
        destinationText: "Train app",
        notes: "Booked the outbound train.",
        status: "completed",
        completedAt: "2026-08-10T19:35:00.000Z"
      }
    ]
  };
}

export function getActingUser(state: DemoState, deviceUserId: DeviceUserId): DemoUser {
  return state.users.find((user) => user.deviceUserId === deviceUserId) ?? state.users[0];
}

export function getPartnerUser(state: DemoState, deviceUserId: DeviceUserId): DemoUser {
  return state.users.find((user) => user.deviceUserId !== deviceUserId) ?? state.users[1];
}

export function findCard(state: DemoState, cardId: string): SyncCard | undefined {
  return state.syncCards.find((card) => card.id === cardId);
}

export function todaysSyncFor(state: DemoState, deviceUserId: DeviceUserId): DailySync | undefined {
  return state.dailySyncs.find((sync) => sync.syncDate === today && sync.userDeviceUserId === deviceUserId);
}

export function upsertDailySync(state: DemoState, sync: Omit<DailySync, "id" | "updatedAt">): DemoState {
  const existing = todaysSyncFor(state, sync.userDeviceUserId);
  const nextSync: DailySync = {
    ...sync,
    id: existing?.id ?? `sync-${sync.userDeviceUserId}-${Date.now()}`,
    updatedAt: new Date().toISOString()
  };

  return {
    ...state,
    dailySyncs: existing
      ? state.dailySyncs.map((item) => (item.id === existing.id ? nextSync : item))
      : [nextSync, ...state.dailySyncs]
  };
}

export function createPlan(state: DemoState, payload: PlanPayload): DemoState {
  return {
    ...state,
    plans: [{ ...payload, id: `plan-${Date.now()}`, status: "not_started" }, ...state.plans]
  };
}

export function completePlan(state: DemoState, planId: string): DemoState {
  return {
    ...state,
    plans: state.plans.map((plan) =>
      plan.id === planId ? { ...plan, status: "completed", completedAt: new Date().toISOString() } : plan
    )
  };
}

export function postponePlan(state: DemoState, planId: string, newScheduledAt: string, postponeReason: string): DemoState {
  return {
    ...state,
    plans: state.plans.map((plan) =>
      plan.id === planId
        ? { ...plan, status: "postponed", postponedFrom: plan.scheduledAt, scheduledAt: newScheduledAt, postponeReason }
        : plan
    )
  };
}

export function hasCompleteRoute(plan: PromisePlan): boolean {
  return [plan.startLatitude, plan.startLongitude, plan.destinationLatitude, plan.destinationLongitude].every(
    (value) => typeof value === "number" && Number.isFinite(value)
  );
}

export function appleMapsUrl(plan: PromisePlan): string {
  if (hasCompleteRoute(plan)) {
    return `https://maps.apple.com/?saddr=${plan.startLatitude},${plan.startLongitude}&daddr=${plan.destinationLatitude},${plan.destinationLongitude}`;
  }

  return `https://maps.apple.com/?q=${encodeURIComponent(plan.destinationText)}`;
}

export function calculateMetrics(state: DemoState): Metrics {
  const syncs = state.dailySyncs;
  const average = (values: number[]) =>
    values.length === 0 ? null : Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  const completedPromises = state.plans.filter((plan) => plan.status === "completed").length;
  const postponedPromises = state.plans.filter((plan) => plan.status === "postponed").length;
  const progressDenominator = completedPromises + postponedPromises;
  const sharedProgressScore = progressDenominator === 0 ? 70 : Math.round((completedPromises / progressDenominator) * 100);
  const syncRate = Math.round((syncs.length / 14) * 100);
  const insufficientData = syncs.length < 3;
  const emotionalTrendScore = insufficientData ? 70 : 84;

  return {
    syncRate,
    averageMood: average(syncs.map((sync) => sync.moodScore)),
    averageEnergy: average(syncs.map((sync) => sync.energyScore)),
    averageLonging: average(syncs.map((sync) => sync.longingScore)),
    lowMoodDays: syncs.filter((sync) => sync.moodScore <= 2).length,
    completedPromises,
    postponedPromises,
    relationshipTemperature: Math.round(syncRate * 0.35 + emotionalTrendScore * 0.35 + sharedProgressScore * 0.3),
    insufficientData
  };
}

export function partnerVisibleNotes(state: DemoState): DailySync[] {
  return state.dailySyncs
    .filter((sync) => sync.visibility === "partner_visible" && sync.note.trim().length > 0)
    .sort((a, b) => b.syncDate.localeCompare(a.syncDate));
}

export function selectedSharedNotes(state: DemoState, selectedNoteIds: string[]): string[] {
  const visible = partnerVisibleNotes(state);
  const selected =
    selectedNoteIds.length > 0
      ? selectedNoteIds.map((id) => visible.find((note) => note.id === id)).filter((note): note is DailySync => Boolean(note))
      : visible;

  return selected.slice(0, 3).map((sync) => sync.note.slice(0, 120));
}

export function latestPrivateDraftNote(state: DemoState, deviceUserId: DeviceUserId): string | undefined {
  return state.dailySyncs
    .filter((sync) => sync.userDeviceUserId === deviceUserId && sync.visibility === "private" && sync.note.trim().length > 0)
    .sort((a, b) => b.syncDate.localeCompare(a.syncDate))[0]?.note.slice(0, 120);
}
