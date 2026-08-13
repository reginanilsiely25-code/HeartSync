const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePairingCode(randomInt: (max: number) => number = (max) => Math.floor(Math.random() * max)) {
  return Array.from({ length: 6 }, () => PAIRING_ALPHABET[randomInt(PAIRING_ALPHABET.length)]).join("");
}

export function normalizePairingCode(input: string) {
  return input.trim().toUpperCase();
}

export function pairingCodeExpiresAt(now = new Date()) {
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}
