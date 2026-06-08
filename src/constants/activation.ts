export const TRIAL_DAYS: number = 14;

const CODE_SALT = 'AJSEATERY-2026';

function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function deriveActivationCode(deviceId: string): string {
  const hash = hashString(`${CODE_SALT}:${deviceId.trim().toUpperCase()}`);
  const code = hash.toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

export function isValidActivationCode(deviceId: string, code: string): boolean {
  return deriveActivationCode(deviceId) === code.trim().toUpperCase();
}
