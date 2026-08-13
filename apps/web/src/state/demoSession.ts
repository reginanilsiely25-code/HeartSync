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
      { id: "alice", deviceUserId: "alice-device", displayName: "小晴", avatarColor: "#d96f66", role: "me" },
      { id: "bao", deviceUserId: "bao-device", displayName: "阿屿", avatarColor: "#3f8f88", role: "partner" }
    ],
    syncCards: [
      {
        id: "card-miss-you",
        title: "很大声地想你",
        emoji: "💌",
        color: "#f2a6a0",
        tags: ["想念", "柔软"],
        defaultMoodScore: 4,
        defaultEnergyScore: 3,
        defaultLongingScore: 5
      },
      {
        id: "card-low-battery",
        title: "电量有点低",
        emoji: "🪫",
        color: "#c2b8a6",
        tags: ["疲惫", "安静"],
        defaultMoodScore: 3,
        defaultEnergyScore: 2,
        defaultLongingScore: 4
      },
      {
        id: "card-need-hug",
        title: "想要一个抱抱",
        emoji: "🤍",
        color: "#b7c7e8",
        tags: ["被照顾", "安慰"],
        defaultMoodScore: 3,
        defaultEnergyScore: 3,
        defaultLongingScore: 5
      },
      {
        id: "card-glowing",
        title: "今天亮晶晶",
        emoji: "✨",
        color: "#f1c65b",
        tags: ["开心", "好消息"],
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
        note: "今天把最难的事做完了，想把安静的晚上留给我们。",
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
        note: "想先自己充一会儿电，晚点再慢慢说。",
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
        note: "那通短电话比我想象中更有用。",
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
        note: "我挑了一个周末地点，想让你投票。",
        visibility: "partner_visible",
        updatedAt: "2026-08-12T13:10:00.000Z"
      }
    ],
    plans: [
      {
        id: "plan-river",
        title: "周六江边散步",
        type: "date",
        scheduledAt: "2026-08-15T17:00",
        ownerDeviceUserId: "alice-device",
        startPlaceText: "上海图书馆",
        destinationText: "西岸",
        startLatitude: 31.2072,
        startLongitude: 121.444,
        destinationLatitude: 31.185,
        destinationLongitude: 121.4648,
        notes: "带一杯茶，日落前找一张长椅。",
        status: "in_progress"
      },
      {
        id: "plan-call",
        title: "纪念日照片电话",
        type: "anniversary",
        scheduledAt: "2026-08-18T20:30",
        ownerDeviceUserId: "bao-device",
        startPlaceText: "家",
        destinationText: "视频房间",
        notes: "这个约定不需要路线坐标。",
        status: "not_started"
      },
      {
        id: "plan-done",
        title: "订九月车票",
        type: "joint_task",
        scheduledAt: "2026-08-10T19:00",
        ownerDeviceUserId: "alice-device",
        startPlaceText: "小晴的书桌",
        destinationText: "购票 App",
        notes: "去程车票已经订好。",
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
