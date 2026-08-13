import { describe, expect, it } from "vitest";
import { generatePairingCode, normalizePairingCode, pairingCodeExpiresAt } from "../../src/domain/pairing";

describe("pairing code rules", () => {
  it("generates 6 uppercase non-ambiguous characters", () => {
    const code = generatePairingCode(() => 0);

    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
    expect(code).not.toMatch(/[0O1I]/);
  });

  it("uses deterministic random indexes against the safe alphabet", () => {
    const indexes = [0, 1, 22, 23, 24, 31];
    const code = generatePairingCode(() => indexes.shift() ?? 0);

    expect(code).toBe("ABYZ29");
  });

  it("normalizes whitespace and casing", () => {
    expect(normalizePairingCode(" ab2cd3 ")).toBe("AB2CD3");
  });

  it("expires pairing codes 24 hours after creation", () => {
    const now = new Date("2026-08-13T08:00:00.000Z");

    expect(pairingCodeExpiresAt(now).toISOString()).toBe("2026-08-14T08:00:00.000Z");
  });
});
