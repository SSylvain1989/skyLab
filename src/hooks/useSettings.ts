import { useCallback, useEffect, useState } from "react";
import { getSettings, isConfigured, saveSettings } from "../services/storage";
import { DEFAULT_SETTINGS } from "../types/github";
import type { Settings } from "../types/github";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [s, c] = await Promise.all([getSettings(), isConfigured()]);
        setSettings(s);
        setConfigured(c);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const save = useCallback(async (newSettings: Settings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    setConfigured(Boolean(newSettings.token && newSettings.username));
  }, []);

  const toggleDarkMode = useCallback(async () => {
    setSettings((prev) => {
      const updated = { ...prev, darkMode: !prev.darkMode };
      saveSettings(updated);
      return updated;
    });
  }, []);

  return { settings, configured, loading, save, toggleDarkMode };
}
