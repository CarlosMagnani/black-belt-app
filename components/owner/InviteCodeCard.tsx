import React from "react";
import { Image, Text, View } from "react-native";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type InviteCodeCardProps = {
  name: string;
  city?: string | null;
  inviteCode: string;
  logoUrl?: string | null;
  onCopy?: () => void;
};

export function InviteCodeCard({
  name,
  city,
  inviteCode,
  logoUrl,
  onCopy,
}: InviteCodeCardProps) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text className="text-sm text-muted-light dark:text-muted-dark">DF</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Minha academia
          </Text>
          <Text
            className="mt-1 font-display text-lg text-strong-light dark:text-strong-dark"
            numberOfLines={1}
          >
            {name}
          </Text>
          {city ? (
            <Text className="text-sm text-muted-light dark:text-muted-dark" numberOfLines={1}>
              {city}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="rounded-2xl border border-dashed border-subtle-light bg-app-light px-4 py-3 dark:border-subtle-dark dark:bg-app-dark">
        <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
          Invite code
        </Text>
        <Text
          className="mt-2 font-display text-2xl tracking-[2px] text-strong-light dark:text-strong-dark"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {inviteCode}
        </Text>
      </View>

      <Button label="Copiar codigo" variant="secondary" onPress={onCopy} />
    </Card>
  );
}
