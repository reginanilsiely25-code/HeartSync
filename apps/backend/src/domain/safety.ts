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
  ["diagnosis", /\b(diagnos(?:e|is|ed)|personality disorder|attachment disorder|mental[- ]health conclusion|medical conclusion)\b/i],
  ["blame", /\b(everything is (?:his|her|their|your) fault|it is (?:his|her|their|your) fault|(?:his|her|their|your) fault)\b/i],
  ["breakup_advice", /\b(break up|breakup|end the relationship|leave (?:him|her|them)|threaten breakup|as leverage)\b/i],
  ["manipulation", /\b(guilt|jealousy|punish(?:ment)?|silent treatment|coerc(?:e|ion)|strategic withholding|control them)\b/i],
  ["privacy_violation", /\b(full chat history|private note exposure|secretly access|hidden monitoring|partner'?s device|partner'?s account)\b/i],
  ["location_tracking", /\b(realtime location|real-time location|location history|track their)\b/i],
  ["self_harm_or_violence", /\b(self[- ]harm|threat(?:en)? violence|violence|instructions for harm|harm (?:yourself|them|him|her))\b/i]
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
