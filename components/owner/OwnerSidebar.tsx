import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { Profile, Academy } from "../../src/core/ports/blackbelt-ports";
import { getBeltEmoji } from "../../src/core/belts/belt-emoji";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";

type OwnerSidebarProps = {
  profile: Profile | null;
  academy: Academy | null;
  className?: string;
};

export function OwnerSidebar({ profile, academy, className }: OwnerSidebarProps) {
  const router = useRouter();

  const displayName = profile?.fullName ?? profile?.email ?? "Mestre";
  const beltName = profile?.currentBelt ?? "Preta";
  const beltEmoji = getBeltEmoji(beltName);
  const degree = profile?.beltDegree;
  const degreeText = degree && degree > 0 ? ` (${degree}º grau)` : "";

  const handleAvatarPress = () => {
    router.push("/owner-settings");
  };

  return (
    <Card className={`gap-4 ${className ?? ""}`}>
      {/* Avatar Section */}
      <View className="items-center">
        <Pressable
          onPress={handleAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Avatar
            uri={profile?.avatarUrl}
            name={displayName}
            size="lg"
          />
        </Pressable>

        {/* Name */}
        <Text
          className="mt-3 text-center font-display text-lg text-strong-light dark:text-strong-dark"
          numberOfLines={1}
        >
          {displayName}
        </Text>

        {/* Belt with Emoji */}
        <View className="mt-1 flex-row items-center gap-1">
          <Text className="text-lg">{beltEmoji}</Text>
          <Text className="text-sm text-muted-light dark:text-muted-dark">
            {beltName}{degreeText}
          </Text>
        </View>
      </View>

      {/* Academy Info */}
      {academy ? (
        <View className="border-t border-subtle-light pt-4 dark:border-subtle-dark">
          <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
            Academia
          </Text>
          <Text className="mt-1 font-display text-base text-strong-light dark:text-strong-dark">
            {academy.name}
          </Text>
          {academy.city ? (
            <Text className="text-xs text-muted-light dark:text-muted-dark">
              📍 {academy.city}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Quick Actions */}
      <Pressable
        onPress={handleAvatarPress}
        accessibilityRole="button"
        className="mt-2 flex-row items-center justify-center rounded-button border border-subtle-light bg-transparent px-4 py-2 dark:border-subtle-dark"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text className="text-sm text-muted-light dark:text-muted-dark">
          ⚙️ Editar perfil
        </Text>
      </Pressable>
    </Card>
  );
}
