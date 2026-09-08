import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';
import { DEFAULT_SETTINGS, getSettings, saveSettings, subscribeToSettings, notifySettingsChanged } from '../lib/chrome-storage';

export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    getSettings().then((initialSettings) => {
      setSettingsState(initialSettings);
      setIsLoaded(true);
    });

    const unsubscribe = subscribeToSettings((updatedSettings) => {
      setSettingsState(updatedSettings);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => {
    setSettingsState((prev) => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      saveSettings(updated);
      notifySettingsChanged(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    setSettingsState(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
    notifySettingsChanged(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, isLoaded };
}
