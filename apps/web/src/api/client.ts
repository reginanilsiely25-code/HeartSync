export type DeviceUserId = "alice-device" | "bao-device";
export type SyncVisibility = "partner_visible" | "private";
export type PlanStatus = "not_started" | "in_progress" | "completed" | "postponed";

export type DailySyncPayload = {
  cardId: string;
  moodScore: number;
  energyScore: number;
  longingScore: number;
  visibility: SyncVisibility;
  note: string;
  syncDate: string;
};

export type PlanPayload = {
  title: string;
  type: "date" | "anniversary" | "joint_task";
  scheduledAt: string;
  ownerDeviceUserId: DeviceUserId;
  startPlaceText: string;
  destinationText: string;
  startLatitude?: number;
  startLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  notes: string;
};

export type PostponePayload = {
  newScheduledAt: string;
  postponeReason?: string;
};

type RequestOptions = RequestInit & {
  deviceUserId?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const DEMO_COUPLE_ID = import.meta.env.VITE_DEMO_COUPLE_ID ?? "demo-couple";

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { deviceUserId, headers, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(deviceUserId ? { "X-Device-User-Id": deviceUserId } : {}),
      ...headers
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

function body(value: unknown): string {
  return JSON.stringify(value);
}

export const heartSyncClient = {
  resetDemo(deviceUserId: DeviceUserId) {
    return request(`/demo/reset`, {
      method: "POST",
      deviceUserId
    });
  },

  getToday(deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/today`, { deviceUserId });
  },

  listSyncCards(deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/sync-cards`, { deviceUserId });
  },

  upsertDailySync(payload: DailySyncPayload, deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/daily-syncs`, {
      method: "PUT",
      deviceUserId,
      body: body(payload)
    });
  },

  listPlans(deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/plans`, { deviceUserId });
  },

  createPlan(payload: PlanPayload, deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/plans`, {
      method: "POST",
      deviceUserId,
      body: body(payload)
    });
  },

  completePlan(planId: string, deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/plans/${planId}/complete`, {
      method: "POST",
      deviceUserId
    });
  },

  postponePlan(planId: string, payload: PostponePayload, deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/plans/${planId}/postpone`, {
      method: "POST",
      deviceUserId,
      body: body(payload)
    });
  },

  generateInsights(selectedNoteIds: string[], deviceUserId: DeviceUserId, coupleId = DEMO_COUPLE_ID) {
    return request(`/couples/${coupleId}/insights/generate`, {
      method: "POST",
      deviceUserId,
      body: body({ selectedNoteIds })
    });
  }
};
