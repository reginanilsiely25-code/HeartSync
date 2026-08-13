import type { MetricsReport } from "./metrics";
import type { AnalysisOutput, UnsafeCategory } from "./safety";

export type TemplateInput = {
  metrics: Pick<
    MetricsReport,
    | "syncRate"
    | "averageMood"
    | "averageEnergy"
    | "averageLonging"
    | "completedPromises"
    | "postponedPromises"
    | "relationshipTemperature"
    | "insufficientData"
  >;
  sharedNotes: string[];
  privateDraftNotes: string[];
  riskFlags?: UnsafeCategory[];
};

function formatAverage(value: number | null): string {
  return value === null ? "not enough entries yet" : value.toFixed(1);
}

export function buildTemplateAnalysis(input: TemplateInput): AnalysisOutput {
  const readinessText = input.metrics.insufficientData
    ? "There is not enough check-in history for a trend claim yet, so this reflection stays close to the raw entries."
    : `Your current relationship temperature is ${input.metrics.relationshipTemperature}, based on sync rhythm, mood and energy direction, and shared promise progress.`;
  const noteText = input.sharedNotes.length > 0
    ? `${input.sharedNotes.length} shared note${input.sharedNotes.length === 1 ? "" : "s"} helped shape this reflection.`
    : "No shared notes were selected for this reflection.";
  const hasPrivateNote = input.privateDraftNotes.length > 0;

  return {
    sharedSummary: `This period shows a ${input.metrics.syncRate}% sync rhythm with average mood ${formatAverage(input.metrics.averageMood)}, energy ${formatAverage(input.metrics.averageEnergy)}, and longing ${formatAverage(input.metrics.averageLonging)}.`,
    trendExplanation: `${readinessText} ${noteText}`,
    suggestions: [
      "Choose one low-pressure check-in time for the next day.",
      `Celebrate ${input.metrics.completedPromises} completed promise${input.metrics.completedPromises === 1 ? "" : "s"} and gently revisit ${input.metrics.postponedPromises} postponed item${input.metrics.postponedPromises === 1 ? "" : "s"}.`
    ],
    privateMessageDraft: hasPrivateNote
      ? "I wrote down something privately that I want to share gently, and I would like to hear how you are feeling too."
      : "I want to check in gently today and hear how you are feeling.",
    riskFlags: input.riskFlags ?? []
  };
}
