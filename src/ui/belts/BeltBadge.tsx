import React, { useMemo } from "react";
import { View } from "react-native";

import type { BeltName, CoralVariant } from "../../core/belts/belts";
import { normalizeDegree } from "../../core/belts/belts";

type BeltBadgeProps = {
  belt: BeltName;
  degree?: number;
  coralVariant?: CoralVariant;
  className?: string;
};

const BELT_WIDTH = 250;
const BELT_HEIGHT = 30;
const TIP_WIDTH = 90;
const TIP_END_WIDTH = 16;
const STRIPE_WIDTH = 9;
const STRIPE_HEIGHT = 40;
const STRIPE_GAP = 5;

const BASE_COLORS: Record<BeltName, string> = {
  Branca: "#F8FAFC",
  Azul: "#2563EB",
  Roxa: "#7C3AED",
  Marrom: "#92400E",
  Preta: "#1F2937",
  Coral: "#DC2626",
  Vermelha: "#B91C1C",
};

const getCoralVariant = (degree?: number, coralVariant?: CoralVariant): CoralVariant =>
  coralVariant ?? (degree && degree >= 8 ? "red-white" : "red-black");

const getBaseSegments = (belt: BeltName, degree?: number, coralVariant?: CoralVariant) => {
  if (belt !== "Coral") return [BASE_COLORS[belt]];

  const variant = getCoralVariant(degree, coralVariant);
  if (variant === "red-white") {
    return [BASE_COLORS.Coral, "#FFFFFF"];
  }

  return [BASE_COLORS.Coral, "#000"];
};

export function BeltBadge({ belt, degree, coralVariant, className }: BeltBadgeProps) {
  const normalized = normalizeDegree(belt, degree);
  const stripeCount = normalized ?? 0;
  const resolvedCoralVariant = belt === "Coral" ? getCoralVariant(normalized, coralVariant) : null;
  const baseSegments = useMemo(
    () => getBaseSegments(belt, normalized, coralVariant),
    [belt, normalized, coralVariant]
  );
  const tailColor = baseSegments[baseSegments.length - 1] ?? BASE_COLORS[belt];
  const tipColor = belt === "Preta" ? "#DC2626" : "#000";
  const stripeColor = "#F8FAFC";
  // Faixas com partes bem escuras (preta / coral red-black) somem no fundo escuro.
  // Um contorno sutil resolve sem mexer na paleta do cinto.
  const needsOutline = belt === "Preta" || (belt === "Coral" && resolvedCoralVariant === "red-black");
  const borderColor =
    belt === "Branca" ? "#CBD5E1" : needsOutline ? "rgba(248, 250, 252, 0.55)" : "transparent";

  return (
    <View
      className={className ?? ""}
      style={{
        width: BELT_WIDTH,
        height: BELT_HEIGHT,
        flexDirection: "row",
        borderRadius: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor,
      }}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        {baseSegments.map((color, index) => (
          <View key={`${belt}-segment-${index}`} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>
      <View
        style={{
          width: TIP_WIDTH,
          marginLeft: 5,
          backgroundColor: tipColor,
          paddingHorizontal: 2,
          paddingVertical: 4,
          flexDirection: "row",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "flex-start",
        }}
      >
        {stripeCount > 0
          ? Array.from({ length: stripeCount }).map((_, index) => (
              <View
                key={`${belt}-stripe-${index}`}
                style={{
                  width: STRIPE_WIDTH,
                  height: STRIPE_HEIGHT,
                  marginRight: STRIPE_GAP,
                  borderRadius: 999,
                  backgroundColor: stripeColor,
                }}
              />
            ))
          : null}
      </View>
      <View
        style={{
          width: TIP_END_WIDTH,
          backgroundColor: tailColor,
        }}
      />
    </View>
  );
}
