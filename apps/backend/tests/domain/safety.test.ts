import { describe, expect, it } from "vitest";
import { detectUnsafeAnalysis } from "../../src/domain/safety";
import { buildTemplateAnalysis } from "../../src/domain/templates";

describe("unsafe analysis detection", () => {
  it("detects breakup advice across generated analysis fields", () => {
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

  it("builds safe local template analysis with recorded risk flags", () => {
    const output = buildTemplateAnalysis({
      metrics: {
        syncRate: 29,
        averageMood: 4,
        averageEnergy: 3.8,
        averageLonging: 3,
        completedPromises: 1,
        postponedPromises: 1,
        relationshipTemperature: 50,
        insufficientData: false
      },
      sharedNotes: ["break up now"],
      privateDraftNotes: ["secretly access their account"],
      riskFlags: ["breakup_advice"]
    });

    expect(output.riskFlags).toEqual(["breakup_advice"]);
    expect(detectUnsafeAnalysis(output)).toEqual([]);
  });
});
