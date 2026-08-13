import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma, type Plan } from "../db/prisma";
import { parseOrError, publicPlan, requireCoupleMember, requireCurrentUser, sendError } from "./helpers";

const nullableCoordinate = z.number().nullable().optional();
const planSchema = z.object({
  title: z.string().min(1, "title is required"),
  type: z.enum(["date", "anniversary", "joint_task"]),
  scheduledAt: z.string().datetime("scheduledAt must be an ISO datetime"),
  status: z.enum(["not_started", "in_progress", "completed", "postponed"]).optional(),
  ownerUserId: z.string().min(1, "ownerUserId is required"),
  startPlaceName: z.string().min(1, "startPlaceName is required"),
  startLatitude: nullableCoordinate,
  startLongitude: nullableCoordinate,
  destinationName: z.string().min(1, "destinationName is required"),
  destinationLatitude: nullableCoordinate,
  destinationLongitude: nullableCoordinate,
  notes: z.string().default("")
});
const patchPlanSchema = planSchema.partial();
const postponeSchema = z.object({
  newScheduledAt: z.string().datetime("newScheduledAt must be an ISO datetime"),
  postponeReason: z.string().optional()
});

export function registerPlanRoutes(app: FastifyInstance) {
  app.get<{ Params: { coupleId: string }; Querystring: { from?: string; to?: string; status?: string } }>("/couples/:coupleId/plans", async (request, reply) => {
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    const from = request.query.from ?? "0000-01-01T00:00:00.000Z";
    const to = request.query.to ?? "9999-12-31T23:59:59.999Z";
    return prisma.state.plans
      .filter((plan) => plan.coupleId === auth.couple.id)
      .filter((plan) => plan.scheduledAt >= from && plan.scheduledAt <= to)
      .filter((plan) => !request.query.status || plan.status === request.query.status)
      .map(publicPlan);
  });

  app.post<{ Params: { coupleId: string } }>("/couples/:coupleId/plans", async (request, reply) => {
    const body = parseOrError(planSchema, request.body, reply);
    if (!body) return;
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    if (!prisma.member(auth.couple.id, body.ownerUserId)) return sendError(reply, 400, "invalid_input", "ownerUserId must belong to this couple");
    const now = prisma.now();
    const plan: Plan = {
      id: prisma.id("plan"),
      coupleId: auth.couple.id,
      title: body.title,
      type: body.type,
      scheduledAt: body.scheduledAt,
      status: body.status ?? "not_started",
      ownerUserId: body.ownerUserId,
      completedAt: null,
      postponedFrom: null,
      postponeReason: null,
      startPlaceName: body.startPlaceName,
      startLatitude: body.startLatitude ?? null,
      startLongitude: body.startLongitude ?? null,
      destinationName: body.destinationName,
      destinationLatitude: body.destinationLatitude ?? null,
      destinationLongitude: body.destinationLongitude ?? null,
      notes: body.notes ?? "",
      createdAt: now,
      updatedAt: now
    };
    prisma.state.plans.push(plan);
    return publicPlan(plan);
  });

  app.patch<{ Params: { planId: string } }>("/plans/:planId", async (request, reply) => {
    const body = parseOrError(patchPlanSchema, request.body, reply);
    if (!body) return;
    const plan = prisma.state.plans.find((candidate) => candidate.id === request.params.planId);
    if (!plan) return sendError(reply, 404, "not_found", "Plan not found");
    const auth = requireCoupleMember(request, reply, plan.coupleId);
    if (!auth) return;
    Object.assign(plan, body, { updatedAt: prisma.now() });
    return publicPlan(plan);
  });

  app.post<{ Params: { planId: string } }>("/plans/:planId/complete", async (request, reply) => {
    const user = requireCurrentUser(request, reply);
    if (!user) return;
    const plan = prisma.state.plans.find((candidate) => candidate.id === request.params.planId);
    if (!plan) return sendError(reply, 404, "not_found", "Plan not found");
    if (!prisma.member(plan.coupleId, user.id)) return sendError(reply, 403, "forbidden", "User is not a member of this couple");
    plan.status = "completed";
    plan.completedAt = prisma.now();
    plan.updatedAt = plan.completedAt;
    return publicPlan(plan);
  });

  app.post<{ Params: { planId: string } }>("/plans/:planId/postpone", async (request, reply) => {
    const body = parseOrError(postponeSchema, request.body, reply);
    if (!body) return;
    const user = requireCurrentUser(request, reply);
    if (!user) return;
    const plan = prisma.state.plans.find((candidate) => candidate.id === request.params.planId);
    if (!plan) return sendError(reply, 404, "not_found", "Plan not found");
    if (!prisma.member(plan.coupleId, user.id)) return sendError(reply, 403, "forbidden", "User is not a member of this couple");
    plan.postponedFrom = plan.scheduledAt;
    plan.scheduledAt = body.newScheduledAt;
    plan.status = "postponed";
    plan.postponeReason = body.postponeReason ?? null;
    plan.updatedAt = prisma.now();
    return publicPlan(plan);
  });
}
