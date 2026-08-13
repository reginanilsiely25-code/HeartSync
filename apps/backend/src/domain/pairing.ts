const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PAIRING_CODE_LENGTH = 6;
const PAIRING_CODE_TTL_MS = 24 * 60 * 60 * 1000;

export function generatePairingCode(
  randomInt: (max: number) => number = (max) => Math.floor(Math.random() * max)
): string {
  return Array.from({ length: PAIRING_CODE_LENGTH }, () => {
    const index = randomInt(PAIRING_ALPHABET.length);
    return PAIRING_ALPHABET[index] ?? PAIRING_ALPHABET[0];
  }).join("");
}

export function normalizePairingCode(input: string): string {
  return input.trim().toUpperCase();
}

export function pairingCodeExpiresAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + PAIRING_CODE_TTL_MS);
}
