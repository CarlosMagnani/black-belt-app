import { Platform } from "react-native";

async function run(fn: () => Promise<void>) {
  if (Platform.OS === "web") return;
  try {
    await fn();
  } catch {
    // Silently fail on simulator / unsupported devices
  }
}

let Haptics: typeof import("expo-haptics") | null = null;

async function load() {
  if (!Haptics && Platform.OS !== "web") {
    Haptics = await import("expo-haptics");
  }
  return Haptics;
}

export async function hapticLight() {
  const h = await load();
  if (h) await run(() => h.impactAsync(h.ImpactFeedbackStyle.Light));
}

export async function hapticMedium() {
  const h = await load();
  if (h) await run(() => h.impactAsync(h.ImpactFeedbackStyle.Medium));
}

export async function hapticSuccess() {
  const h = await load();
  if (h) await run(() => h.notificationAsync(h.NotificationFeedbackType.Success));
}

export async function hapticError() {
  const h = await load();
  if (h) await run(() => h.notificationAsync(h.NotificationFeedbackType.Error));
}

export async function hapticSelection() {
  const h = await load();
  if (h) await run(() => h.selectionAsync());
}
