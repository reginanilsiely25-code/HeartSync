import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { buildTemplateAnalysis, calculateMetrics, detectUnsafeAnalysis, mockAnalysis, selectNotes } from "../domain/insightRules";
import { parseOrError, requireCoupleMember } from "./helpers";

const insightSchema = z.object({
  period: z.enum(["week", "month"]).default("week"),
  selectedNoteIds: z.array(z.string()).default([]),
  mockMode: z.enum(["safe", "unsafe", "failure"]).default("safe")
});

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function registerInsightRoutes(app: FastifyInstance) {
  app.get<{ Params: { coupleId: string }; Querystring: { period?: "week" | "month" } }>("/couples/:coupleId/insights", async (request, reply) => {
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    return prisma.state.insightReports.filter(
      (report) => report.coupleId === auth.couple.id && (!request.query.period || report.periodType === request.query.period)
    );
  });

  async function generateInsight(request: FastifyRequest<{ Params: { coupleId: string } }>, reply: FastifyReply) {
    const body = parseOrError(insightSchema, request.body ?? {}, reply);
    if (!body) return;
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;

    const now = new Date();
    const period = body.period ?? "week";
    const selectedNoteIds = body.selectedNoteIds ?? [];
    const mockMode = body.mockMode ?? "safe";
    const days = period === "week" ? 7 : 30;
    const periodStart = dateOnly(addDays(now, -(days - 1)));
    const periodEnd = dateOnly(now);
    const dailySyncs = prisma.state.dailySyncs.filter(
      (sync) => sync.coupleId === auth.couple.id && sync.syncDate >= periodStart && sync.syncDate <= periodEnd
    );
    const plans = prisma.state.plans.filter(
      (plan) => plan.coupleId === auth.couple.id && plan.scheduledAt.slice(0, 10) >= periodStart && plan.scheduledAt.slice(0, 10) <= periodEnd
    );
    const metrics = calculateMetrics(dailySyncs, plans, days * prisma.membersForCouple(auth.couple.id).length);
    const notes = selectNotes(dailySyncs, auth.user.id, selectedNoteIds);
    const template = buildTemplateAnalysis(metrics, notes);
    const generated = mockAnalysis(mockMode, template);
    const riskFlags = generated ? detectUnsafeAnalysis(generated) : [];
    const fallbackUsed = !generated || riskFlags.length > 0;
    const finalOutput = fallbackUsed ? { ...template, riskFlags } : generated;
    const generatedAt = prisma.now();
    const report = {
      id: prisma.id("insight"),
      coupleId: auth.couple.id,
      periodType: period,
      periodStart,
      periodEnd,
      temperatureScore: metrics.relationshipTemperature,
      metrics,
      sharedSummary: finalOutput.sharedSummary,
      trendExplanation: finalOutput.trendExplanation,
      suggestions: finalOutput.suggestions,
      privateSuggestions: [{ userId: auth.user.id, messageDraft: finalOutput.privateMessageDraft }],
      riskFlags,
      fallbackUsed,
      generatedAt
    };
    prisma.state.insightReports = prisma.state.insightReports.filter(
      (existing) =>
        !(
          existing.coupleId === report.coupleId &&
          existing.periodType === report.periodType &&
          existing.periodStart === report.periodStart &&
          existing.periodEnd === report.periodEnd
        )
    );
    prisma.state.insightReports.push(report);
    return {
      ...report,
      privateMessageDraft: finalOutput.privateMessageDraft
    };
  }

  app.post<{ Params: { coupleId: string } }>("/couples/:coupleId/insights/generate", generateInsight);
  app.post<{ Params: { coupleId: string } }>("/couples/:coupleId/llm-analysis", generateInsight);
}
