import React from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";

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
  const { width } = useWindowDimensions();
  const isCompact = width < 900;

  const userInitials = getInitials(userName);
  const academyInitials = getInitials(academyName);
  const userLabel = userName ?? "Aluno";
  const academyLabel = academyName ?? "Academia";
  const beltToShow: BeltName = belt ?? "Branca";

  return (
    <View className={["w-full", className ?? ""].join(" ")}>
      <View className={isCompact ? "gap-4" : "flex-row items-stretch justify-center gap-4"}>
        <View
          className={[
            "min-h-[208px] items-center justify-center rounded-card border border-subtle-light bg-surface-light px-4 py-4 shadow-card dark:border-subtle-dark dark:bg-surface-dark",
            isCompact ? "w-full" : "w-[320px] max-w-[48%]",
          ].join(" ")}
        >
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
          <Text
            className="mt-3 text-center text-lg font-display text-strong-light dark:text-strong-dark"
            numberOfLines={1}
          >
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

        <View
          className={[
            "min-h-[208px] items-center justify-center rounded-card border border-subtle-light bg-surface-light px-4 py-4 shadow-card dark:border-subtle-dark dark:bg-surface-dark",
            isCompact ? "w-full" : "w-[320px] max-w-[48%]",
          ].join(" ")}
        >
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
          <Text
            className="mt-3 text-center text-lg font-display text-strong-light dark:text-strong-dark"
            numberOfLines={2}
          >
            {academyLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
