import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { parseOrError, requireCoupleMember, requireCurrentUser, sendError } from "./helpers";

const score = z.number().int().min(1, "score must be 1-5").max(5, "score must be 1-5");
const createCardSchema = z.object({
  title: z.string().min(1, "title is required"),
  emoji: z.string().min(1, "emoji is required"),
  color: z.string().min(1, "color is required"),
  tags: z.array(z.string()).default([]),
  defaultMoodScore: score,
  defaultEnergyScore: score,
  defaultLongingScore: score
});
const patchCardSchema = createCardSchema.partial();

export function registerSyncCardRoutes(app: FastifyInstance) {
  app.get<{ Params: { coupleId: string } }>("/couples/:coupleId/sync-cards", async (request, reply) => {
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    return prisma.state.syncCards.filter((card) => card.coupleId === auth.couple.id && !card.isArchived);
  });

  app.post<{ Params: { coupleId: string } }>("/couples/:coupleId/sync-cards", async (request, reply) => {
    const body = parseOrError(createCardSchema, request.body, reply);
    if (!body) return;
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    const now = prisma.now();
    const card = {
      id: prisma.id("card"),
      coupleId: auth.couple.id,
      ...body,
      tags: body.tags ?? [],
      isArchived: false,
      createdByUserId: auth.user.id,
      createdAt: now,
      updatedAt: now
    };
    prisma.state.syncCards.push(card);
    return card;
  });

  app.patch<{ Params: { cardId: string } }>("/sync-cards/:cardId", async (request, reply) => {
    const body = parseOrError(patchCardSchema, request.body, reply);
    if (!body) return;
    const card = prisma.state.syncCards.find((candidate) => candidate.id === request.params.cardId);
    if (!card) return sendError(reply, 404, "not_found", "Sync card not found");
    const auth = requireCoupleMember(request, reply, card.coupleId);
    if (!auth) return;
    Object.assign(card, body, { updatedAt: prisma.now() });
    return card;
  });

  app.delete<{ Params: { cardId: string } }>("/sync-cards/:cardId", async (request, reply) => {
    const user = requireCurrentUser(request, reply);
    if (!user) return;
    const card = prisma.state.syncCards.find((candidate) => candidate.id === request.params.cardId);
    if (!card) return sendError(reply, 404, "not_found", "Sync card not found");
    if (!prisma.member(card.coupleId, user.id)) return sendError(reply, 403, "forbidden", "User is not a member of this couple");
    card.isArchived = true;
    card.updatedAt = prisma.now();
    return card;
  });
}
