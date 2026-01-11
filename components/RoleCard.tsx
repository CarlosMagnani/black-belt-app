import React from "react";
import { Pressable, Text, View } from "react-native";

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
  const iconColor = accent === "brand" ? "#1E40AF" : "#0F172A";
  const iconWrapClass =
    accent === "brand" ? "bg-brand-50 border-brand-100" : "bg-slate-100 border-slate-200";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={[
        "rounded-2xl border p-5 shadow-sm",
        "bg-white",
        accent === "brand" ? "border-brand-100" : "border-slate-200",
      ].join(" ")}
      style={({ pressed }) => (pressed ? { opacity: 0.92 } : undefined)}
    >
      <View className="flex-row items-center gap-4">
        <View className={`h-12 w-12 items-center justify-center rounded-xl border ${iconWrapClass}`}>
          <Icon color={iconColor} size={22} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg text-ink">{title}</Text>
          <Text className="mt-1 text-sm text-slate-600">{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}
