import type { BeltName } from "./belts";

const BELT_EMOJIS: Record<BeltName, string> = {
  Branca: "🤍",
  Azul: "💙",
  Roxa: "💜",
  Marrom: "🤎",
  Preta: "🖤",
  Coral: "❤️",
  Vermelha: "❤️",
};

export const getBeltEmoji = (belt: BeltName | string | null | undefined): string => {
  if (!belt) return "🥋";
  return BELT_EMOJIS[belt as BeltName] ?? "🥋";
};
