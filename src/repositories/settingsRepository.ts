import { getDb } from '../db/client';
import { isValidActivationCode } from '../constants/activation';

function generateDeviceId(): string {
  const part = () => Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, '0');
  return `${part()}-${part()}`;
}

async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [key, value]);
}

export async function getDeviceId(): Promise<string> {
  const existing = await getSetting('device_id');
  if (existing) return existing;
  const id = generateDeviceId();
  await setSetting('device_id', id);
  return id;
}

export async function getFirstLaunchAt(): Promise<string> {
  const existing = await getSetting('first_launch_at');
  if (existing) return existing;
  const now = new Date().toISOString();
  await setSetting('first_launch_at', now);
  return now;
}

export interface ActivationStatus {
  activated: boolean;
  activatedAt: string | null;
}

export async function getActivationStatus(): Promise<ActivationStatus> {
  const [activated, activatedAt] = await Promise.all([
    getSetting('activated'),
    getSetting('activated_at'),
  ]);
  return { activated: activated === '1', activatedAt };
}

export async function activateWithCode(code: string): Promise<boolean> {
  const deviceId = await getDeviceId();
  if (!isValidActivationCode(deviceId, code)) return false;
  await setSetting('activated', '1');
  await setSetting('activated_at', new Date().toISOString());
  return true;
}
