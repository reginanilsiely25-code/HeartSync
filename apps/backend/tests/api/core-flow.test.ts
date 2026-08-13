import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";

async function json(response: { payload: string }) {
  return JSON.parse(response.payload);
}

describe("HeartSync backend core flow", () => {
  it("supports device users, couple setup, demo reset, and health", async () => {
    const app = buildApp();
    try {
      const health = await app.inject({ method: "GET", url: "/health" });
      const alice = await app.inject({
        method: "POST",
        url: "/users/device",
        payload: { deviceUserId: "alice-device", displayName: "Alice", avatarColor: "#E86A92" }
      });
      const couple = await app.inject({
        method: "POST",
        url: "/couples",
        headers: { "x-device-user-id": "alice-device" }
      });
      const reset = await app.inject({ method: "POST", url: "/demo/reset" });

      expect(health.statusCode).toBe(200);
      expect(await json(health)).toEqual({ ok: true });
      expect(alice.statusCode).toBe(200);
      expect(couple.statusCode).toBe(200);
      expect(reset.statusCode).toBe(200);
      expect((await json(reset)).users.map((user: { deviceUserId: string }) => user.deviceUserId)).toEqual([
        "alice-device",
        "bao-device"
      ]);
    } finally {
      await app.close();
    }
  });

  it("runs the couple workflow with privacy, plans, and safe insight fallback", async () => {
    const app = buildApp();
    try {
      const reset = await app.inject({ method: "POST", url: "/demo/reset" });
      const seeded = await json(reset);
      const coupleId = seeded.couple.id;

      const cardsResponse = await app.inject({
        method: "GET",
        url: `/couples/${coupleId}/sync-cards`,
        headers: { "x-device-user-id": "alice-device" }
      });
      expect(cardsResponse.statusCode).toBe(200);
      const cards = await json(cardsResponse);
      expect(cards).toHaveLength(4);

      const createdCardResponse = await app.inject({
        method: "POST",
        url: `/couples/${coupleId}/sync-cards`,
        headers: { "x-device-user-id": "alice-device" },
        payload: {
          title: "Quiet focus",
          emoji: "Q",
          color: "#4A5568",
          tags: ["focus"],
          defaultMoodScore: 3,
          defaultEnergyScore: 4,
          defaultLongingScore: 2
        }
      });
      expect(createdCardResponse.statusCode).toBe(200);
      const createdCard = await json(createdCardResponse);

      const patchedCardResponse = await app.inject({
        method: "PATCH",
        url: `/sync-cards/${createdCard.id}`,
        headers: { "x-device-user-id": "alice-device" },
        payload: { title: "Quiet focus updated", tags: ["focus", "steady"] }
      });
      expect(patchedCardResponse.statusCode).toBe(200);
      expect((await json(patchedCardResponse)).title).toBe("Quiet focus updated");

      const today = new Date().toISOString().slice(0, 10);
      const privateSync = await app.inject({
        method: "PUT",
        url: `/couples/${coupleId}/daily-syncs/${today}`,
        headers: { "x-device-user-id": "alice-device" },
        payload: {
          cardId: createdCard.id,
          moodScore: 2,
          energyScore: 2,
          longingScore: 5,
          tags: ["private"],
          note: "This private note should not be visible to Bao.",
          visibility: "private"
        }
      });
      expect(privateSync.statusCode).toBe(200);

      const partnerTodayResponse = await app.inject({
        method: "GET",
        url: `/couples/${coupleId}/today?date=${today}`,
        headers: { "x-device-user-id": "bao-device" }
      });
      expect(partnerTodayResponse.statusCode).toBe(200);
      const partnerToday = await json(partnerTodayResponse);
      const aliceToday = partnerToday.members.find((member: { deviceUserId: string }) => member.deviceUserId === "alice-device");
      expect(aliceToday.sync).toEqual({ status: "synced_hidden" });
      expect(partnerToday.metrics.syncCount).toBeGreaterThanOrEqual(1);
      expect(partnerToday.metrics.averageMood).not.toBeNull();

      const plansResponse = await app.inject({
        method: "POST",
        url: `/couples/${coupleId}/plans`,
        headers: { "x-device-user-id": "alice-device" },
        payload: {
          title: "Museum afternoon",
          type: "date",
          scheduledAt: "2026-09-01T10:00:00.000Z",
          ownerUserId: seeded.users[0].id,
          startPlaceName: "Home",
          startLatitude: 31.2304,
          startLongitude: 121.4737,
          destinationName: "Museum",
          destinationLatitude: 31.2397,
          destinationLongitude: 121.4998,
          notes: "Bring the sketchbook."
        }
      });
      expect(plansResponse.statusCode).toBe(200);
      const plan = await json(plansResponse);
      expect(plan.hasRoute).toBe(true);

      const completedResponse = await app.inject({
        method: "POST",
        url: `/plans/${plan.id}/complete`,
        headers: { "x-device-user-id": "alice-device" }
      });
      expect(completedResponse.statusCode).toBe(200);
      expect((await json(completedResponse)).status).toBe("completed");

      const postponedResponse = await app.inject({
        method: "POST",
        url: `/plans/${plan.id}/postpone`,
        headers: { "x-device-user-id": "alice-device" },
        payload: { newScheduledAt: "2026-09-08T10:00:00.000Z", postponeReason: "Rain check" }
      });
      expect(postponedResponse.statusCode).toBe(200);
      const postponed = await json(postponedResponse);
      expect(postponed.status).toBe("postponed");
      expect(postponed.postponedFrom).toBe("2026-09-01T10:00:00.000Z");

      const badSync = await app.inject({
        method: "PUT",
        url: `/couples/${coupleId}/daily-syncs/${today}`,
        headers: { "x-device-user-id": "alice-device" },
        payload: {
          cardId: createdCard.id,
          moodScore: 6,
          energyScore: 2,
          longingScore: 5,
          tags: [],
          note: "",
          visibility: "partner_visible"
        }
      });
      expect(badSync.statusCode).toBe(400);
      expect(await json(badSync)).toEqual({ error: { code: "invalid_input", message: "moodScore must be 1-5" } });

      const insightResponse = await app.inject({
        method: "POST",
        url: `/couples/${coupleId}/insights/generate`,
        headers: { "x-device-user-id": "alice-device" },
        payload: { period: "week", mockMode: "unsafe" }
      });
      expect(insightResponse.statusCode).toBe(200);
      const insight = await json(insightResponse);
      expect(insight.fallbackUsed).toBe(true);
      expect(insight.riskFlags).toContain("breakup_advice");
      expect(insight.sharedSummary).not.toMatch(/break up/i);
      expect(insight.privateMessageDraft).toBeTruthy();

      const archivedResponse = await app.inject({
        method: "DELETE",
        url: `/sync-cards/${createdCard.id}`,
        headers: { "x-device-user-id": "alice-device" }
      });
      expect(archivedResponse.statusCode).toBe(200);
      expect((await json(archivedResponse)).isArchived).toBe(true);
    } finally {
      await app.close();
    }
  });
});
