import React from "react";
import { Image, Text, View } from "react-native";

import type { MemberProfile } from "../../src/core/ports/blackbelt-ports";
import type { BeltRank } from "../../src/core/belts/belts";
import { BeltBadge } from "../../src/ui/belts/BeltBadge";
import { BeltPicker } from "../../src/ui/belts/BeltPicker";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type MembersListItemProps = {
  member: MemberProfile;
  isEditing: boolean;
  isSaving: boolean;
  beltValue: BeltRank;
  onChangeBelt: (value: BeltRank) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

const getInitials = (value?: string | null) => {
  if (!value) return "A";
  const parts = value.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
};

export function MembersListItem({
  member,
  isEditing,
  isSaving,
  beltValue,
  onChangeBelt,
  onEdit,
  onCancel,
  onSave,
}: MembersListItemProps) {
  const name = member.fullName || member.email || "Aluno";
  const initials = getInitials(name);
  const belt = member.currentBelt ?? "Branca";

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
          {member.avatarUrl ? (
            <Image source={{ uri: member.avatarUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text className="text-sm text-muted-light dark:text-muted-dark">{initials}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-display text-base text-strong-light dark:text-strong-dark">
            {name}
          </Text>
          <Text className="text-xs text-muted-light dark:text-muted-dark">
            Faixa atual: {belt}
          </Text>
        </View>
      </View>

      {isEditing ? (
        <View className="gap-3">
          <BeltPicker value={beltValue} onChange={onChangeBelt} />
          <View className="flex-row gap-2">
            <Button
              label={isSaving ? "Salvando..." : "Salvar"}
              onPress={onSave}
              disabled={isSaving}
              className="flex-1"
            />
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={onCancel}
              disabled={isSaving}
              className="flex-1"
            />
          </View>
        </View>
      ) : (
        <View className="gap-3">
          <BeltBadge belt={belt} degree={member.beltDegree ?? undefined} className="max-w-full" />
          <Button label="Editar faixa/graus" variant="secondary" onPress={onEdit} />
        </View>
      )}
    </Card>
  );
}
