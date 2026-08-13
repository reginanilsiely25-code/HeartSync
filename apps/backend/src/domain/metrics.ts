export type DailySyncVisibility = "partner_visible" | "private";

export type DailySyncMetric = {
  userId: string;
  syncDate: string;
  moodScore: number;
  energyScore: number;
  longingScore: number;
  visibility: DailySyncVisibility;
};

export type PlanMetric = {
  status: "not_started" | "in_progress" | "completed" | "postponed" | "overdue";
};

export type MetricsInput = {
  periodStart: string;
  periodEnd: string;
  dailySyncs: DailySyncMetric[];
  plans: PlanMetric[];
  expectedSyncSlots: number;
};

export type TrendDeltas = {
  mood: number;
  energy: number;
  longing: number;
};

export type MetricsReport = {
  syncRate: number;
  averageMood: number | null;
  averageEnergy: number | null;
  averageLonging: number | null;
  lowMoodDays: number;
  completedPromises: number;
  postponedPromises: number;
  overduePromises: number;
  syncStabilityScore: number;
  emotionalTrendScore: number;
  sharedProgressScore: number;
  relationshipTemperature: number;
  insufficientData: boolean;
  trendSummary: "insufficient data" | "trend available";
  trendDeltas: TrendDeltas;
};

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return roundOne(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function averageForDate(syncs: DailySyncMetric[], syncDate: string, key: "moodScore" | "energyScore" | "longingScore"): number {
  const dateSyncs = syncs.filter((sync) => sync.syncDate === syncDate);
  if (dateSyncs.length === 0) {
    return 0;
  }

  return dateSyncs.reduce((sum, sync) => sum + sync[key], 0) / dateSyncs.length;
}

function calculateTrendDeltas(dailySyncs: DailySyncMetric[]): TrendDeltas {
  const dates = Array.from(new Set(dailySyncs.map((sync) => sync.syncDate))).sort();
  if (dates.length < 2) {
    return { mood: 0, energy: 0, longing: 0 };
  }

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  return {
    mood: roundOne(averageForDate(dailySyncs, lastDate, "moodScore") - averageForDate(dailySyncs, firstDate, "moodScore")),
    energy: roundOne(averageForDate(dailySyncs, lastDate, "energyScore") - averageForDate(dailySyncs, firstDate, "energyScore")),
    longing: roundOne(averageForDate(dailySyncs, lastDate, "longingScore") - averageForDate(dailySyncs, firstDate, "longingScore"))
  };
}

function calculateEmotionalTrendScore(dailySyncs: DailySyncMetric[], insufficientData: boolean): number {
  if (insufficientData) {
    return 70;
  }

  const deltas = calculateTrendDeltas(dailySyncs);
  let score = 70;

  if (deltas.mood >= 0) {
    score += 15;
  }

  if (deltas.energy >= 0) {
    score += 10;
  }

  if (deltas.longing <= 0) {
    score += 5;
  }

  return clampScore(score);
}

export function calculateMetrics(input: MetricsInput): MetricsReport {
  const syncRate = input.expectedSyncSlots <= 0
    ? 0
    : clampScore((input.dailySyncs.length / input.expectedSyncSlots) * 100);
  const completedPromises = input.plans.filter((plan) => plan.status === "completed").length;
  const postponedPromises = input.plans.filter((plan) => plan.status === "postponed").length;
  const overduePromises = input.plans.filter((plan) => plan.status === "overdue").length;
  const promiseDenominator = completedPromises + postponedPromises + overduePromises;
  const sharedProgressScore = promiseDenominator === 0
    ? 70
    : clampScore((completedPromises / promiseDenominator) * 100);
  const insufficientData = input.dailySyncs.length < 3;
  const emotionalTrendScore = calculateEmotionalTrendScore(input.dailySyncs, insufficientData);
  const syncStabilityScore = syncRate;
  const relationshipTemperature = clampScore(
    syncStabilityScore * 0.35 + emotionalTrendScore * 0.35 + sharedProgressScore * 0.3
  );

  return {
    syncRate,
    averageMood: average(input.dailySyncs.map((sync) => sync.moodScore)),
    averageEnergy: average(input.dailySyncs.map((sync) => sync.energyScore)),
    averageLonging: average(input.dailySyncs.map((sync) => sync.longingScore)),
    lowMoodDays: new Set(input.dailySyncs.filter((sync) => sync.moodScore <= 2).map((sync) => sync.syncDate)).size,
    completedPromises,
    postponedPromises,
    overduePromises,
    syncStabilityScore,
    emotionalTrendScore,
    sharedProgressScore,
    relationshipTemperature,
    insufficientData,
    trendSummary: insufficientData ? "insufficient data" : "trend available",
    trendDeltas: calculateTrendDeltas(input.dailySyncs)
  };
}
