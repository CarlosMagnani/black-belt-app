import React from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "../src/ui/theme/ThemeProvider";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type RoleCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  onPress: () => void;
  accent?: "brand" | "ink";
  selected?: boolean;
};

export function RoleCard({
  title,
  description,
  icon: Icon,
  onPress,
  accent = "ink",
  selected = false,
}: RoleCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const iconColor = selected
    ? "#fff"
    : accent === "brand"
    ? isDark
      ? "#E0E7FF"
      : "#1E40AF"
    : isDark
    ? "#E5E7EB"
    : "#0F172A";

  const iconWrapClass = selected
    ? "bg-brand-500 border-brand-600"
    : accent === "brand"
    ? "bg-brand-50 border-brand-100 dark:bg-brand-600/20 dark:border-brand-600/40"
    : "bg-app-light border-subtle-light dark:bg-app-dark dark:border-subtle-dark";

  const cardBorderClass = selected
    ? "border-brand-500 border-2"
    : accent === "brand"
    ? "border-brand-100 dark:border-brand-600/40"
    : "border-subtle-light dark:border-subtle-dark";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={[
        "rounded-card border p-5 shadow-card",
        "bg-surface-light dark:bg-surface-dark",
        cardBorderClass,
      ].join(" ")}
      style={({ pressed }) => (pressed ? { opacity: 0.92 } : undefined)}
    >
      <View className="flex-row items-center gap-4">
        <View
          className={`h-12 w-12 items-center justify-center rounded-xl border ${iconWrapClass}`}
        >
          <Icon color={iconColor} size={22} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
            {title}
          </Text>
          <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
            {description}
          </Text>
        </View>
        {selected && (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-500">
            <Text className="text-xs text-white">✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
