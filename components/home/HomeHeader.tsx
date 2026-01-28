import React from "react";
import { Text, View } from "react-native";

import type { BeltName } from "../../src/core/belts/belts";
import { AvatarCluster } from "./AvatarCluster";

type HomeHeaderProps = {
  displayName: string;
  belt?: BeltName | null;
  beltDegree?: number | null;
  userName?: string | null;
  userAvatarUrl?: string | null;
  academyName?: string | null;
  academyLogoUrl?: string | null;
};

export function HomeHeader({
  displayName,
  belt,
  beltDegree,
  userName,
  userAvatarUrl,
  academyName,
  academyLogoUrl,
}: HomeHeaderProps) {
  return (
    <View className="flex-col gap-4">
      <AvatarCluster
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        academyName={academyName}
        academyLogoUrl={academyLogoUrl}
        belt={belt}
        beltDegree={beltDegree}
      />
    </View>
  );
}
