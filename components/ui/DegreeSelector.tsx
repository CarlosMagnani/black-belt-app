import React from "react";
import { Pressable, Text, View } from "react-native";

import type { BeltName } from "../../src/core/belts/belts";

type DegreeSelectorProps = {
  label?: string;
  value?: number;
  belt?: BeltName;
  onSelect?: (degree: number) => void;
  errorMessage?: string | null;
  className?: string;
};

const getMaxDegrees = (belt?: BeltName): number => {
  if (!belt) return 4;
  if (belt === "Branca") return 4;
  if (belt === "Preta") return 6; // Dan degrees
  return 4; // Blue, Purple, Brown
};

export function DegreeSelector({
  label,
  value = 0,
  belt,
  onSelect,
  errorMessage,
  className,
}: DegreeSelectorProps) {
  const maxDegrees = getMaxDegrees(belt);
  const degrees = Array.from({ length: maxDegrees + 1 }, (_, i) => i);

  return (
    <View className={className}>
      {label ? (
        <Text className="mb-3 text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
          {label}
        </Text>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        {degrees.map((degree) => {
          const isSelected = value === degree;
          return (
            <Pressable
              key={degree}
              onPress={() => onSelect?.(degree)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View
                className={[
                  "h-12 w-12 items-center justify-center rounded-xl",
                  isSelected
                    ? "bg-brand-600"
                    : "border border-subtle-dark bg-surface-dark",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-lg font-semibold",
                    isSelected ? "text-white" : "text-text-primary-dark",
                  ].join(" ")}
                >
                  {degree}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-2 text-xs text-muted-light dark:text-muted-dark">
        {value === 0
          ? "Sem graus"
          : value === 1
          ? "1 grau"
          : `${value} graus`}
      </Text>

      {errorMessage ? (
        <Text className="mt-2 text-xs text-red-500">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
