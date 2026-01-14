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
};

export function RoleCard({
  title,
  description,
  icon: Icon,
  onPress,
  accent = "ink",
}: RoleCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const iconColor =
    accent === "brand" ? (isDark ? "#E0E7FF" : "#1E40AF") : isDark ? "#E5E7EB" : "#0F172A";
  const iconWrapClass =
    accent === "brand"
      ? "bg-brand-50 border-brand-100 dark:bg-brand-600/20 dark:border-brand-600/40"
      : "bg-app-light border-subtle-light dark:bg-app-dark dark:border-subtle-dark";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={[
        "rounded-card border p-5 shadow-card",
        "bg-surface-light dark:bg-surface-dark",
        accent === "brand"
          ? "border-brand-100 dark:border-brand-600/40"
          : "border-subtle-light dark:border-subtle-dark",
      ].join(" ")}
      style={({ pressed }) => (pressed ? { opacity: 0.92 } : undefined)}
    >
      <View className="flex-row items-center gap-4">
        <View className={`h-12 w-12 items-center justify-center rounded-xl border ${iconWrapClass}`}>
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
      </View>
    </Pressable>
  );
}
