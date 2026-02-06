import React from "react";
import { Image, Text, View } from "react-native";

import type { CheckinListItem } from "../../src/core/ports/blackbelt-ports";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type CheckinApprovalCardProps = {
  item: CheckinListItem;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
};

const getInitials = (value?: string | null) => {
  if (!value) return "A";
  const parts = value.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
};

export function CheckinApprovalCard({
  item,
  isProcessing,
  onApprove,
  onReject,
}: CheckinApprovalCardProps) {
  const studentName = item.studentName ?? "Aluno";
  const initials = getInitials(studentName);
  const weekday = item.classWeekday !== null ? WEEKDAY_LABELS[item.classWeekday] : "-";
  const startTime = item.classStartTime ? item.classStartTime.slice(0, 5) : "-";

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
          {item.studentAvatarUrl ? (
            <Image source={{ uri: item.studentAvatarUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text className="text-sm text-muted-light dark:text-muted-dark">{initials}</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-display text-base text-strong-light dark:text-strong-dark">
            {studentName}
          </Text>
          <Text className="text-xs text-muted-light dark:text-muted-dark">
            {item.classTitle ?? "Aula"} - {weekday} {startTime}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <Button
          label={isProcessing ? "Processando..." : "Aprovar"}
          onPress={onApprove}
          disabled={isProcessing}
          className="flex-1"
        />
        <Button
          label="Rejeitar"
          variant="secondary"
          onPress={onReject}
          disabled={isProcessing}
          className="flex-1"
        />
      </View>
    </Card>
  );
}
