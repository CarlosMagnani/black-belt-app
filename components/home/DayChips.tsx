import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type DayChip = {
  label: string;
  value: number;
};

type DayChipsProps = {
  days: DayChip[];
  selected: number;
  onSelect: (value: number) => void;
};

export function DayChips({ days, selected, onSelect }: DayChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerStyle={{ paddingHorizontal: 4 }}
    >
      <View className="flex-row gap-2">
        {days.map((day) => {
          const isActive = selected === day.value;
          return (
            <Pressable
              key={day.value}
              accessibilityRole="button"
              onPress={() => onSelect(day.value)}
              className={[
                "rounded-full border px-3 py-1",
                isActive
                  ? "border-brand-600 bg-brand-600"
                  : "border-subtle-light bg-surface-light dark:border-subtle-dark dark:bg-surface-dark",
              ].join(" ")}
              style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
            >
              <Text
                className={[
                  "text-xs font-body",
                  isActive ? "text-white" : "text-muted-light dark:text-muted-dark",
                ].join(" ")}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
