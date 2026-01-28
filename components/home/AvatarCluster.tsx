import React from "react";
import { Image, Text, View } from "react-native";

import type { BeltName } from "../../src/core/belts/belts";
import { BeltBadge } from "../../src/ui/belts/BeltBadge";

type AvatarClusterProps = {
  userName?: string | null;
  userAvatarUrl?: string | null;
  academyName?: string | null;
  academyLogoUrl?: string | null;
  belt?: BeltName | null;
  beltDegree?: number | null;
  className?: string;
};

const getInitials = (value?: string | null) => {
  if (!value) return "A";
  const parts = value.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
};

export function AvatarCluster({
  userName,
  userAvatarUrl,
  academyName,
  academyLogoUrl,
  belt,
  beltDegree,
  className,
}: AvatarClusterProps) {
  const userInitials = getInitials(userName);
  const academyInitials = getInitials(academyName);
  const userLabel = userName ?? "Aluno";
  const academyLabel = academyName ?? "Academia";
  const beltToShow: BeltName = belt ?? "Branca";

  return (
    <View className={["w-full items-center justify-center", className ?? ""].join(" ")}>
      <View className="flex-row flex-wrap items-start justify-center gap-4">
        <View className="w-[300px] max-w-full items-center rounded-card border border-subtle-light bg-surface-light px-4 py-4 shadow-card dark:border-subtle-dark dark:bg-surface-dark">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
            {userAvatarUrl ? (
              <Image
                source={{ uri: userAvatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
                accessibilityLabel="Avatar do aluno"
              />
            ) : (
              <Text className="text-lg font-body text-muted-light dark:text-muted-dark">
                {userInitials}
              </Text>
            )}
          </View>
          <Text className="mt-3 text-lg text-muted-light dark:text-muted-dark" numberOfLines={1}>
            {userLabel}
          </Text>
          <View className="mt-2 items-center">
            <BeltBadge
              belt={beltToShow}
              degree={beltDegree ?? undefined}
              className="max-w-full"
            />
          </View>
        </View>
        <View className="w-[300px] h-[207.767px] max-w-full items-center rounded-card border border-subtle-light bg-surface-light px-4 py-4 shadow-card dark:border-subtle-dark dark:bg-surface-dark">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
            {academyLogoUrl ? (
              <Image
                source={{ uri: academyLogoUrl }}
                className="h-full w-full"
                resizeMode="cover"
                accessibilityLabel="Logo da academia"
              />
            ) : (
              <Text className="text-sm font-body text-muted-light dark:text-muted-dark">
                {academyInitials}
              </Text>
            )}
          </View>
          <Text className="mt-3 text-lg font-display text-muted-light dark:text-muted-dark" numberOfLines={1}>
            {academyLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
