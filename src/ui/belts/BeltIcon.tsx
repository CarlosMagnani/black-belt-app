import React, { useMemo } from "react";
import { View } from "react-native";

import type { BeltName, CoralVariant } from "../../core/belts/belts";
import { getMaxDegrees, normalizeDegree } from "../../core/belts/belts";

type BeltIconSize = "sm" | "md" | "lg";

type BeltIconProps = {
  belt: BeltName;
  degree?: number;
  coralVariant?: CoralVariant;
  size?: BeltIconSize;
  className?: string;
};

const SIZE_MAP: Record<BeltIconSize, { width: number; height: number; tip: number }> = {
  sm: { width: 48, height: 12, tip: 12 },
  md: { width: 64, height: 16, tip: 16 },
  lg: { width: 80, height: 20, tip: 20 },
};

const BASE_COLORS: Record<BeltName, string> = {
  Branca: "#F8FAFC",
  Azul: "#2563EB",
  Roxa: "#7C3AED",
  Marrom: "#92400E",
  Preta: "#111827",
  Coral: "#DC2626",
  Vermelha: "#B91C1C",
};

const resolveCoralVariant = (degree?: number, coralVariant?: CoralVariant): CoralVariant =>
  coralVariant ?? (degree !== undefined && degree >= 8 ? "red-white" : "red-black");

const getBaseSegments = (belt: BeltName, degree?: number, coralVariant?: CoralVariant) => {
  if (belt !== "Coral") return [BASE_COLORS[belt]];

  const variant = resolveCoralVariant(degree, coralVariant);
  if (variant === "red-white") {
    return [BASE_COLORS.Coral, "#FFFFFF"];
  }

  return [BASE_COLORS.Coral, "#111827"];
};

export function BeltIcon({
  belt,
  degree,
  coralVariant,
  size = "lg",
  className,
}: BeltIconProps) {
  const clampedDegree = normalizeDegree(belt, degree) ?? 0;
  const stripeCount = Math.min(clampedDegree, getMaxDegrees(belt));
  const { width, height, tip } = SIZE_MAP[size];
  const baseSegments = useMemo(
    () => getBaseSegments(belt, normalizeDegree(belt, degree), coralVariant),
    [belt, degree, coralVariant]
  );
  const borderColor = belt === "Branca" ? "#E2E8F0" : "transparent";
  const tipColor = "#111827";

  return (
    <View
      className={className ?? ""}
      style={{
        width,
        height,
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: height / 2,
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
          width: tip,
          backgroundColor: tipColor,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {stripeCount > 0
          ? Array.from({ length: stripeCount }).map((_, index) => (
              <View
                key={`${belt}-stripe-${index}`}
                style={{
                  width: Math.max(2, Math.floor(tip / 7)),
                  height: Math.floor(height * 0.6),
                  marginLeft: index === 0 ? 0 : 2,
                  borderRadius: 999,
                  backgroundColor: "#F8FAFC",
                }}
              />
            ))
          : null}
      </View>
    </View>
  );
}
