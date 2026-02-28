import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { BeltName } from "../../src/core/belts/belts";

type BeltSelectorProps = {
  label?: string;
  value?: BeltName;
  onSelect?: (belt: BeltName) => void;
  errorMessage?: string | null;
  className?: string;
};

const BELTS: { name: BeltName; color: string; textColor: string; borderColor?: string }[] = [
  { name: "Branca", color: "#F8FAFC", textColor: "#0F172A", borderColor: "#CBD5E1" },
  { name: "Azul", color: "#2563EB", textColor: "#FFFFFF" },
  { name: "Roxa", color: "#7C3AED", textColor: "#FFFFFF" },
  { name: "Marrom", color: "#92400E", textColor: "#FFFFFF" },
  { name: "Preta", color: "#171717", textColor: "#FFFFFF" },
];

export function BeltSelector({
  label,
  value,
  onSelect,
  errorMessage,
  className,
}: BeltSelectorProps) {
  return (
    <View className={className}>
      {label ? (
        <Text className="mb-3 text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
          {label}
        </Text>
      ) : null}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {BELTS.map((belt) => {
          const isSelected = value === belt.name;
          return (
            <Pressable
              key={belt.name}
              onPress={() => onSelect?.(belt.name)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <View
                className={[
                  "items-center justify-center rounded-xl px-5 py-4",
                  isSelected ? "ring-2 ring-brand-500" : "",
                ].join(" ")}
                style={{
                  backgroundColor: belt.color,
                  borderWidth: isSelected ? 3 : belt.borderColor ? 1 : 0,
                  borderColor: isSelected ? "#6366F1" : belt.borderColor ?? "transparent",
                  minWidth: 80,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: belt.textColor }}
                >
                  {belt.name}
                </Text>
              </View>
              {isSelected ? (
                <View className="mt-2 h-1 rounded-full bg-brand-500" />
              ) : (
                <View className="mt-2 h-1" />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {errorMessage ? (
        <Text className="mt-2 text-xs text-red-500">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
