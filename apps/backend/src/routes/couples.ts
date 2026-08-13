import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma, type DailySync } from "../db/prisma";
import { generatePairingCode, normalizePairingCode, pairingCodeExpiresAt } from "../domain/pairing";
import { parseOrError, requireCoupleMember, requireCurrentUser, sendError } from "./helpers";

const joinSchema = z.object({ pairingCode: z.string().min(1, "pairingCode is required") });

function publicCouple(coupleId: string) {
  const couple = prisma.coupleById(coupleId);
  return {
    ...couple,
    members: prisma.membersForCouple(coupleId).map(({ user, ...member }) => ({ ...member, user }))
  };
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function publicSync(sync: DailySync, isCurrentUser: boolean) {
  if (!isCurrentUser && sync.visibility === "private") return { status: "synced_hidden" };
  const card = prisma.state.syncCards.find((candidate) => candidate.id === sync.cardId) ?? null;
  return {
    status: "synced",
    id: sync.id,
    syncDate: sync.syncDate,
    visibility: sync.visibility,
    card,
    moodScore: sync.moodScore,
    energyScore: sync.energyScore,
    longingScore: sync.longingScore,
    tags: sync.tags,
    note: sync.note,
    updatedAt: sync.updatedAt
  };
}

export function registerCoupleRoutes(app: FastifyInstance) {
  app.post("/couples", async (request, reply) => {
    const user = requireCurrentUser(request, reply);
    if (!user) return;
    if (prisma.coupleForUser(user.id)) return sendError(reply, 409, "already_in_couple", "User already belongs to a couple");
    const now = prisma.now();
    const couple = {
      id: prisma.id("couple"),
      pairingCode: generatePairingCode(),
      pairingCodeExpiresAt: pairingCodeExpiresAt(new Date(now)).toISOString(),
      startedAt: now,
      createdByUserId: user.id,
      createdAt: now,
      updatedAt: now
    };
    prisma.state.couples.push(couple);
    prisma.state.members.push({ coupleId: couple.id, userId: user.id, role: "creator", joinedAt: now });
    return publicCouple(couple.id);
  });

  app.post("/couples/join", async (request, reply) => {
    const body = parseOrError(joinSchema, request.body, reply);
    if (!body) return;
    const user = requireCurrentUser(request, reply);
    if (!user) return;
    if (prisma.coupleForUser(user.id)) return sendError(reply, 409, "already_in_couple", "User already belongs to a couple");
    const normalized = normalizePairingCode(body.pairingCode);
    const couple = prisma.state.couples.find((candidate) => candidate.pairingCode === normalized);
    if (!couple) return sendError(reply, 404, "not_found", "Pairing code not found");
    if (Date.parse(couple.pairingCodeExpiresAt) < Date.now()) {
      return sendError(reply, 410, "pairing_expired", "Pairing code expired");
    }
    if (prisma.membersForCouple(couple.id).length >= 2) return sendError(reply, 409, "couple_full", "Couple already has two members");
    prisma.state.members.push({ coupleId: couple.id, userId: user.id, role: "partner", joinedAt: prisma.now() });
    return publicCouple(couple.id);
  });

  app.get<{ Params: { coupleId: string } }>("/couples/:coupleId", async (request, reply) => {
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    return publicCouple(auth.couple.id);
  });

  app.get<{ Params: { coupleId: string }; Querystring: { date?: string } }>("/couples/:coupleId/today", async (request, reply) => {
    const auth = requireCoupleMember(request, reply, request.params.coupleId);
    if (!auth) return;
    const date = request.query.date ?? new Date().toISOString().slice(0, 10);
    const members = prisma.membersForCouple(auth.couple.id).map(({ user }) => {
      const sync = prisma.state.dailySyncs.find((candidate) => candidate.coupleId === auth.couple.id && candidate.userId === user.id && candidate.syncDate === date);
      return {
        id: user.id,
        deviceUserId: user.deviceUserId,
        displayName: user.displayName,
        avatarColor: user.avatarColor,
        sync: sync ? publicSync(sync, user.id === auth.user.id) : { status: "not_synced" }
      };
    });
    const syncs = prisma.state.dailySyncs.filter((sync) => sync.coupleId === auth.couple.id && sync.syncDate === date);
    return {
      couple: auth.couple,
      date,
      members,
      metrics: {
        syncCount: syncs.length,
        averageMood: average(syncs.map((sync) => sync.moodScore)),
        averageEnergy: average(syncs.map((sync) => sync.energyScore)),
        averageLonging: average(syncs.map((sync) => sync.longingScore))
      }
    };
  });
}
