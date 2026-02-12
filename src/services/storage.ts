import { load } from "@tauri-apps/plugin-store";
import { DEFAULT_SETTINGS } from "../types/github";
import type { Settings } from "../types/github";

const STORE_FILE = "settings.json";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE, {
      defaults: { ...DEFAULT_SETTINGS },
      autoSave: true,
    });
  }
  return storeInstance;
}

export async function getSettings(): Promise<Settings> {
  const store = await getStore();
  const token = ((await store.get("token")) as string) || DEFAULT_SETTINGS.token;
  const username =
    ((await store.get("username")) as string) || DEFAULT_SETTINGS.username;
  const pollingInterval =
    ((await store.get("pollingInterval")) as number) ||
    DEFAULT_SETTINGS.pollingInterval;
  const darkMode =
    (await store.get("darkMode")) as boolean ?? DEFAULT_SETTINGS.darkMode;
  const showNotionLink =
    (await store.get("showNotionLink")) as boolean ?? DEFAULT_SETTINGS.showNotionLink;
  const showCopyButton =
    (await store.get("showCopyButton")) as boolean ?? DEFAULT_SETTINGS.showCopyButton;
  const showCIBadge =
    (await store.get("showCIBadge")) as boolean ?? DEFAULT_SETTINGS.showCIBadge;
  const expoToken =
    ((await store.get("expoToken")) as string) || DEFAULT_SETTINGS.expoToken;
  const expoProjectSlug =
    ((await store.get("expoProjectSlug")) as string) || DEFAULT_SETTINGS.expoProjectSlug;
  const activeTab =
    ((await store.get("activeTab")) as Settings["activeTab"]) || DEFAULT_SETTINGS.activeTab;
  return { token, username, pollingInterval, darkMode, showNotionLink, showCopyButton, showCIBadge, expoToken, expoProjectSlug, activeTab };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const store = await getStore();
  await store.set("token", settings.token);
  await store.set("username", settings.username);
  await store.set("pollingInterval", settings.pollingInterval);
  await store.set("darkMode", settings.darkMode);
  await store.set("showNotionLink", settings.showNotionLink);
  await store.set("showCopyButton", settings.showCopyButton);
  await store.set("showCIBadge", settings.showCIBadge);
  await store.set("expoToken", settings.expoToken);
  await store.set("expoProjectSlug", settings.expoProjectSlug);
  await store.set("activeTab", settings.activeTab);
  await store.save();
}

export async function isConfigured(): Promise<boolean> {
  const settings = await getSettings();
  return Boolean(settings.token && settings.username);
}

export function isExpoConfigured(settings: Settings): boolean {
  return Boolean(settings.expoToken && settings.expoProjectSlug);
}
