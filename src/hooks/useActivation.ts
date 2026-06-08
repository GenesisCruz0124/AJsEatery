import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as settingsRepository from '../repositories/settingsRepository';
import { TRIAL_DAYS } from '../constants/activation';

const DAY_MS = 24 * 60 * 60 * 1000;

export function useActivation() {
  const [loading, setLoading] = useState(true);
  const [activated, setActivated] = useState(false);
  const [activatedAt, setActivatedAt] = useState<string | null>(null);
  const [firstLaunchAt, setFirstLaunchAt] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(TRIAL_DAYS);

  const load = useCallback(async () => {
    setLoading(true);
    const [launch, status, devId] = await Promise.all([
      settingsRepository.getFirstLaunchAt(),
      settingsRepository.getActivationStatus(),
      settingsRepository.getDeviceId(),
    ]);
    const elapsedDays = Math.floor((Date.now() - new Date(launch).getTime()) / DAY_MS);
    setFirstLaunchAt(launch);
    setActivated(status.activated);
    setActivatedAt(status.activatedAt);
    setDeviceId(devId);
    setDaysRemaining(Math.max(0, TRIAL_DAYS - elapsedDays));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submitCode = useCallback(
    async (code: string) => {
      const ok = await settingsRepository.activateWithCode(code);
      if (ok) await load();
      return ok;
    },
    [load]
  );

  return { loading, activated, activatedAt, firstLaunchAt, deviceId, daysRemaining, submitCode, refresh: load };
}
