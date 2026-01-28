export type BeltName =
  | "Branca"
  | "Azul"
  | "Roxa"
  | "Marrom"
  | "Preta"
  | "Coral"
  | "Vermelha";

export type CoralVariant = "red-black" | "red-white";

export type BeltRank = {
  name: BeltName;
  degree?: number;
  coralVariant?: CoralVariant;
};

const BELT_ORDER: BeltName[] = [
  "Branca",
  "Azul",
  "Roxa",
  "Marrom",
  "Preta",
  "Coral",
  "Vermelha",
];

const MAX_DEGREES: Record<BeltName, number> = {
  Branca: 4,
  Azul: 4,
  Roxa: 4,
  Marrom: 4,
  Preta: 7,
  Coral: 8,
  Vermelha: 10,
};

const MIN_DEGREES: Partial<Record<BeltName, number>> = {
  Coral: 7,
  Vermelha: 9,
};

export const getMaxDegrees = (belt: BeltName) => MAX_DEGREES[belt];

export const normalizeDegree = (belt: BeltName, degree?: number) => {
  if (degree === undefined || degree === null || Number.isNaN(degree)) return undefined;
  const max = getMaxDegrees(belt);
  const min = MIN_DEGREES[belt] ?? 0;
  const normalized = Math.floor(degree);
  return Math.max(min, Math.min(max, normalized));
};

export const getNextBelt = (belt: BeltName): BeltName => {
  const index = BELT_ORDER.indexOf(belt);
  if (index < 0 || index >= BELT_ORDER.length - 1) return belt;
  return BELT_ORDER[index + 1];
};
