export type BeltName =
  | "Branca"
  | "Azul"
  | "Roxa"
  | "Marrom"
  | "Preta"
  | "Coral"
  | "Vermelha";

export type BeltDegree = number;

export type CoralVariant = "red-black" | "red-white";

export type BeltConfig = {
  name: BeltName;
  minDegree: number;
  maxDegree: number;
};

export type BeltRank = {
  name: BeltName;
  degree?: BeltDegree;
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

const BELT_CONFIG: Record<BeltName, BeltConfig> = {
  Branca: { name: "Branca", minDegree: 0, maxDegree: 4 },
  Azul: { name: "Azul", minDegree: 0, maxDegree: 4 },
  Roxa: { name: "Roxa", minDegree: 0, maxDegree: 4 },
  Marrom: { name: "Marrom", minDegree: 0, maxDegree: 4 },
  Preta: { name: "Preta", minDegree: 0, maxDegree: 7 },
  Coral: { name: "Coral", minDegree: 7, maxDegree: 8 },
  Vermelha: { name: "Vermelha", minDegree: 9, maxDegree: 10 },
};

export const getMinDegrees = (belt: BeltName) => BELT_CONFIG[belt].minDegree;

export const getMaxDegrees = (belt: BeltName) => BELT_CONFIG[belt].maxDegree;

export const getAllowedDegrees = (belt: BeltName) => {
  const { minDegree, maxDegree } = BELT_CONFIG[belt];
  return Array.from({ length: maxDegree - minDegree + 1 }, (_, index) => minDegree + index);
};

export const normalizeDegree = (belt: BeltName, degree?: number) => {
  if (degree === undefined || degree === null || Number.isNaN(degree)) return undefined;
  const max = getMaxDegrees(belt);
  const min = getMinDegrees(belt);
  const normalized = Math.floor(degree);
  return Math.max(min, Math.min(max, normalized));
};

export const getNextBelt = (belt: BeltName): BeltName => {
  const index = BELT_ORDER.indexOf(belt);
  if (index < 0 || index >= BELT_ORDER.length - 1) return belt;
  return BELT_ORDER[index + 1];
};
