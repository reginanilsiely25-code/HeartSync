import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma, type DailySync } from "../db/prisma";
import { parseOrError, requireCoupleMember } from "./helpers";

function namedScore(name: string) {
  return z.number().int().min(1, `${name} must be 1-5`).max(5, `${name} must be 1-5`);
}

const syncSchema = z.object({
  cardId: z.string().min(1, "cardId is required"),
  moodScore: namedScore("moodScore"),
  energyScore: namedScore("energyScore"),
  longingScore: namedScore("longingScore"),
  tags: z.array(z.string()).default([]),
  note: z.string().default(""),
  visibility: z.enum(["partner_visible", "private"], { message: "visibility must be partner_visible or private" }).default("partner_visible")
});

export function registerDailySyncRoutes(app: FastifyInstance) {
  app.get<{ Params: { coupleId: string }; Querystring: { from?: string; to?: string } }>("/couples/:coupleId/daily-syncs", async (request, reply) => {
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    const from = request.query.from ?? "0000-01-01";
    const to = request.query.to ?? "9999-12-31";
    return prisma.state.dailySyncs
      .filter((sync) => sync.coupleId === auth.couple.id && sync.syncDate >= from && sync.syncDate <= to)
      .map((sync) => {
        if (sync.userId !== auth.user.id && sync.visibility === "private") {
          return { id: sync.id, userId: sync.userId, syncDate: sync.syncDate, visibility: "private", status: "synced_hidden" };
        }
        return sync;
      });
  });

  app.put<{ Params: { coupleId: string; date: string } }>("/couples/:coupleId/daily-syncs/:date", async (request, reply) => {
    const body = parseOrError(syncSchema, request.body, reply);
    if (!body) return;
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    const card = prisma.state.syncCards.find((candidate) => candidate.id === body.cardId && candidate.coupleId === auth.couple.id);
    if (!card) return reply.status(404).send({ error: { code: "not_found", message: "Sync card not found" } });
    const now = prisma.now();
    const existing = prisma.state.dailySyncs.find(
      (sync) => sync.coupleId === auth.couple.id && sync.userId === auth.user.id && sync.syncDate === request.params.date
    );
    if (existing) {
      Object.assign(existing, { ...body, tags: body.tags ?? [], note: body.note ?? "", visibility: body.visibility ?? "partner_visible" }, { updatedAt: now });
      return existing;
    }
    const sync: DailySync = {
      id: prisma.id("sync"),
      coupleId: auth.couple.id,
      userId: auth.user.id,
      syncDate: request.params.date,
      ...body,
      tags: body.tags ?? [],
      note: body.note ?? "",
      visibility: body.visibility ?? "partner_visible",
      createdAt: now,
      updatedAt: now
    };
    prisma.state.dailySyncs.push(sync);
    return sync;
  });
}
