import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError, type ZodSchema } from "zod";
import { prisma, type Couple, type User } from "../db/prisma";

export type ErrorCode =
  | "invalid_input"
  | "not_found"
  | "forbidden"
  | "pairing_expired"
  | "couple_full"
  | "already_in_couple"
  | "unsafe_fallback";

export function sendError(reply: FastifyReply, statusCode: number, code: ErrorCode, message: string) {
  return reply.status(statusCode).send({ error: { code, message } });
}

export function parseBody<T>(schema: ZodSchema<T>, value: unknown) {
  return schema.parse(value);
}

export function zodMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid request input";
  }
  return "Invalid request input";
}

export function parseOrError<T>(schema: ZodSchema<T>, value: unknown, reply: FastifyReply): T | undefined {
  try {
    return parseBody(schema, value);
  } catch (error) {
    sendError(reply, 400, "invalid_input", zodMessage(error));
    return undefined;
  }
}

export function currentDeviceUserId(request: FastifyRequest) {
  const header = request.headers["x-device-user-id"];
  return Array.isArray(header) ? header[0] : header;
}

export function requireCurrentUser(request: FastifyRequest, reply: FastifyReply): User | undefined {
  const deviceUserId = currentDeviceUserId(request);
  if (!deviceUserId) {
    sendError(reply, 403, "forbidden", "X-Device-User-Id is required");
    return undefined;
  }
  const user = prisma.userByDevice(deviceUserId);
  if (!user) {
    sendError(reply, 404, "not_found", "Device user not found");
    return undefined;
  }
  return user;
}

export function requireCoupleMember(
  request: FastifyRequest,
  reply: FastifyReply,
  coupleId: string
): { user: User; couple: Couple } | undefined {
  const user = requireCurrentUser(request, reply);
  if (!user) return undefined;
  const couple = prisma.coupleById(coupleId);
  if (!couple) {
    sendError(reply, 404, "not_found", "Couple not found");
    return undefined;
  }
  if (!prisma.member(coupleId, user.id)) {
    sendError(reply, 403, "forbidden", "User is not a member of this couple");
    return undefined;
  }
  return { user, couple };
}

export function publicPlan(plan: import("../db/prisma").Plan) {
  return {
    ...plan,
    hasRoute:
      plan.startLatitude !== null &&
      plan.startLongitude !== null &&
      plan.destinationLatitude !== null &&
      plan.destinationLongitude !== null
  };
}
