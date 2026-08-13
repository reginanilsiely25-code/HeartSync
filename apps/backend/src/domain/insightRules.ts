import type { DailySync, Plan } from "../db/prisma";

export type UnsafeCategory =
  | "diagnosis"
  | "blame"
  | "breakup_advice"
  | "manipulation"
  | "privacy_violation"
  | "location_tracking"
  | "self_harm_or_violence";

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

export type AnalysisOutput = {
  sharedSummary: string;
  trendExplanation: string;
  suggestions: string[];
  privateMessageDraft: string;
  riskFlags: UnsafeCategory[];
};

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateMetrics(dailySyncs: DailySync[], plans: Plan[], expectedSyncSlots: number): MetricsReport {
  const completedPromises = plans.filter((plan) => plan.status === "completed").length;
  const postponedPromises = plans.filter((plan) => plan.status === "postponed").length;
  const promiseDenominator = completedPromises + postponedPromises;
  const syncRate = expectedSyncSlots === 0 ? 0 : Math.round((dailySyncs.length / expectedSyncSlots) * 100);
  const insufficientData = dailySyncs.length < 3;
  const sharedProgressScore = promiseDenominator === 0 ? 70 : Math.round((completedPromises / promiseDenominator) * 100);
  const emotionalTrendScore = insufficientData ? 70 : 82;
  const relationshipTemperature = clamp(syncRate * 0.35 + emotionalTrendScore * 0.35 + sharedProgressScore * 0.3);

  return {
    syncRate,
    averageMood: average(dailySyncs.map((sync) => sync.moodScore)),
    averageEnergy: average(dailySyncs.map((sync) => sync.energyScore)),
    averageLonging: average(dailySyncs.map((sync) => sync.longingScore)),
    lowMoodDays: dailySyncs.filter((sync) => sync.moodScore <= 2).length,
    completedPromises,
    postponedPromises,
    syncStabilityScore: clamp(syncRate),
    emotionalTrendScore,
    sharedProgressScore,
    relationshipTemperature,
    insufficientData,
    trendSummary: insufficientData ? "insufficient data" : "steady rhythm"
  };
}

export function selectNotes(dailySyncs: DailySync[], currentUserId: string, selectedNoteIds: string[]) {
  const withNotes = dailySyncs.filter((sync) => sync.note.trim().length > 0);
  const visible = withNotes.filter((sync) => sync.visibility === "partner_visible");
  const selected = selectedNoteIds
    .map((id) => visible.find((sync) => sync.id === id))
    .filter((sync): sync is DailySync => Boolean(sync));
  const sharedSource = selected.length > 0 ? selected : [...visible].sort((a, b) => b.syncDate.localeCompare(a.syncDate));
  const privateDraft = [...withNotes]
    .filter((sync) => sync.visibility === "private" && sync.userId === currentUserId)
    .sort((a, b) => b.syncDate.localeCompare(a.syncDate))
    .slice(0, 1)
    .map((sync) => sync.note.slice(0, 120));

  return {
    sharedNotes: sharedSource.slice(0, 3).map((sync) => sync.note.slice(0, 120)),
    privateDraftNotes: privateDraft
  };
}

const unsafeRules: Array<[UnsafeCategory, RegExp]> = [
  ["diagnosis", /diagnosis|personality disorder|attachment disorder|mental-health/i],
  ["blame", /their fault|your fault|everything is (his|her|their) fault/i],
  ["breakup_advice", /break up|breakup|threaten breakup|as leverage/i],
  ["manipulation", /jealousy|silent treatment|control them|coerc|punish/i],
  ["privacy_violation", /full chat history|secretly access|partner's device|partner's account/i],
  ["location_tracking", /realtime location|location history|track their/i],
  ["self_harm_or_violence", /self-harm|violence|harm/i]
];

export function detectUnsafeAnalysis(output: AnalysisOutput): UnsafeCategory[] {
  const text = [output.sharedSummary, output.trendExplanation, ...output.suggestions, output.privateMessageDraft].join("\n");
  return unsafeRules.filter(([, pattern]) => pattern.test(text)).map(([category]) => category);
}

export function buildTemplateAnalysis(metrics: MetricsReport, notes: { sharedNotes: string[]; privateDraftNotes: string[] }): AnalysisOutput {
  const dataPhrase = metrics.insufficientData
    ? "There is not enough recent sync data for trend claims yet."
    : `Your recent sync rate is ${metrics.syncRate}%, with room for a gentle check-in ritual.`;
  const notePhrase = notes.sharedNotes.length > 0 ? ` Recent visible notes mention: ${notes.sharedNotes.join(" / ")}.` : "";

  return {
    sharedSummary: `${dataPhrase}${notePhrase}`,
    trendExplanation: "This reflection uses local HeartSync templates and aggregate scores only.",
    suggestions: [
      "Choose one low-pressure moment to ask how today felt.",
      "Keep the next promise small enough that both of you can follow through."
    ],
    privateMessageDraft:
      notes.privateDraftNotes[0] ??
      "I want to share one small thing from today and hear how your day felt too.",
    riskFlags: []
  };
}

export function mockAnalysis(mode: "safe" | "unsafe" | "failure", template: AnalysisOutput): AnalysisOutput | null {
  if (mode === "failure") return null;
  if (mode === "unsafe") {
    return {
      sharedSummary: "You should break up if they do not change immediately.",
      trendExplanation: "Everything is their fault this week.",
      suggestions: ["Use silent treatment as leverage."],
      privateMessageDraft: "Threaten breakup as leverage.",
      riskFlags: []
    };
  }
  return {
    ...template,
    sharedSummary: "This week shows a steady HeartSync rhythm.",
    trendExplanation: template.trendExplanation,
    suggestions: template.suggestions,
    privateMessageDraft: template.privateMessageDraft
  };
}
