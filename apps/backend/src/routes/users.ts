import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { parseOrError, sendError } from "./helpers";

const deviceUserSchema = z.object({
  deviceUserId: z.string().min(1, "deviceUserId is required"),
  displayName: z.string().min(1, "displayName is required"),
  avatarColor: z.string().min(1, "avatarColor is required")
});

const patchUserSchema = z.object({
  displayName: z.string().min(1).optional(),
  avatarColor: z.string().min(1).optional()
});

export function registerUserRoutes(app: FastifyInstance) {
  app.post("/users/device", async (request, reply) => {
    const body = parseOrError(deviceUserSchema, request.body, reply);
    if (!body) return;
    const now = prisma.now();
    let user = prisma.userByDevice(body.deviceUserId);
    if (user) {
      user.displayName = body.displayName;
      user.avatarColor = body.avatarColor;
      user.updatedAt = now;
    } else {
      user = { id: prisma.id("user"), ...body, createdAt: now, updatedAt: now };
      prisma.state.users.push(user);
    }
    return { ...user, couple: prisma.coupleForUser(user.id) ?? null };
  });

  app.patch<{ Params: { userId: string } }>("/users/:userId", async (request, reply) => {
    const body = parseOrError(patchUserSchema, request.body, reply);
    if (!body) return;
    const user = prisma.userById(request.params.userId);
    if (!user) return sendError(reply, 404, "not_found", "User not found");
    Object.assign(user, body, { updatedAt: prisma.now() });
    return user;
  });
}
