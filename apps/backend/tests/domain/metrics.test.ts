import { describe, expect, it } from "vitest";
import { calculateMetrics } from "../../src/domain/metrics";

describe("relationship metrics", () => {
  it("calculates sync rate, averages, promise stats, and relationship temperature", () => {
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
    expect(report.averageMood).toBe(4);
    expect(report.averageEnergy).toBe(3.8);
    expect(report.averageLonging).toBe(3);
    expect(report.lowMoodDays).toBe(0);
    expect(report.completedPromises).toBe(1);
    expect(report.postponedPromises).toBe(1);
    expect(report.sharedProgressScore).toBe(50);
    expect(report.emotionalTrendScore).toBe(100);
    expect(report.relationshipTemperature).toBe(60);
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
    expect(report.completedPromises).toBe(0);
  });

  it("uses trend deltas to build the emotional trend score", () => {
    const report = calculateMetrics({
      periodStart: "2026-08-01",
      periodEnd: "2026-08-06",
      dailySyncs: [
        { userId: "u1", syncDate: "2026-08-01", moodScore: 3, energyScore: 3, longingScore: 4, visibility: "partner_visible" },
        { userId: "u2", syncDate: "2026-08-01", moodScore: 3, energyScore: 3, longingScore: 4, visibility: "partner_visible" },
        { userId: "u1", syncDate: "2026-08-06", moodScore: 4, energyScore: 4, longingScore: 3, visibility: "private" },
        { userId: "u2", syncDate: "2026-08-06", moodScore: 4, energyScore: 4, longingScore: 3, visibility: "partner_visible" }
      ],
      plans: [],
      expectedSyncSlots: 12
    });

    expect(report.trendDeltas).toEqual({ mood: 1, energy: 1, longing: -1 });
    expect(report.emotionalTrendScore).toBe(100);
    expect(report.sharedProgressScore).toBe(70);
  });
});
