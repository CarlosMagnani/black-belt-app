import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import type { BeltName, BeltRank, CoralVariant } from "../../core/belts/belts";
import { getAllowedDegrees, normalizeDegree } from "../../core/belts/belts";
import { BeltIcon } from "./BeltIcon";

type BeltPickerProps = {
  value: BeltRank;
  onChange: (value: BeltRank) => void;
  disabled?: boolean;
  className?: string;
};

const BELT_OPTIONS: BeltName[] = [
  "Branca",
  "Azul",
  "Roxa",
  "Marrom",
  "Preta",
  "Coral",
  "Vermelha",
];

const resolveCoralVariant = (degree?: number): CoralVariant =>
  degree !== undefined && degree >= 8 ? "red-white" : "red-black";

export function BeltPicker({ value, onChange, disabled, className }: BeltPickerProps) {
  const currentBelt = value?.name ?? "Branca";
  const normalizedDegree = normalizeDegree(currentBelt, value?.degree);
  const degrees = useMemo(() => getAllowedDegrees(currentBelt), [currentBelt]);

  const handleSelectBelt = (belt: BeltName) => {
    const nextDegree = normalizeDegree(belt, value?.degree) ?? getAllowedDegrees(belt)[0];
    const coralVariant = belt === "Coral" ? resolveCoralVariant(nextDegree) : undefined;
    onChange({ name: belt, degree: nextDegree, coralVariant });
  };

  const handleSelectDegree = (degree: number) => {
    const coralVariant = currentBelt === "Coral" ? resolveCoralVariant(degree) : value?.coralVariant;
    onChange({ name: currentBelt, degree, coralVariant });
  };

  return (
    <View className={["gap-4", className ?? ""].join(" ")}>
      <View>
        <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
          Faixa
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {BELT_OPTIONS.map((belt) => {
            const isSelected = belt === currentBelt;
            return (
              <Pressable
                key={belt}
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => handleSelectBelt(belt)}
                className={[
                  "flex-row items-center gap-2 rounded-xl border px-3 py-2",
                  isSelected
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-600/20"
                    : "border-subtle-light dark:border-subtle-dark",
                ].join(" ")}
                style={({ pressed }) =>
                  pressed && !disabled ? { opacity: 0.85 } : undefined
                }
              >
                <BeltIcon belt={belt} size="sm" />
                <Text className="text-sm text-strong-light dark:text-strong-dark">{belt}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
          Grau
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-2">
          {degrees.map((degree) => {
            const isSelected = normalizedDegree === degree;
            return (
              <Pressable
                key={`${currentBelt}-${degree}`}
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => handleSelectDegree(degree)}
                className={[
                  "rounded-xl border px-3 py-2",
                  isSelected
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-600/20"
                    : "border-subtle-light dark:border-subtle-dark",
                ].join(" ")}
                style={({ pressed }) =>
                  pressed && !disabled ? { opacity: 0.85 } : undefined
                }
              >
                <Text className="text-sm text-strong-light dark:text-strong-dark">
                  {degree}o grau
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
