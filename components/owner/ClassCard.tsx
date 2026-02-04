import React from "react";
import { Text, View } from "react-native";

import type { AcademyClass } from "../../src/core/ports/dojoflow-ports";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type ClassCardProps = {
  item: AcademyClass;
  onEdit: () => void;
  onDelete: () => void;
};

const formatTime = (value: string) => value.slice(0, 5);

export function ClassCard({ item, onEdit, onDelete }: ClassCardProps) {
  const weekday = WEEKDAY_LABELS[item.weekday] ?? "-";
  const recurrence = item.isRecurring ? "Recorrente" : item.startDate ? `Aula unica (${item.startDate})` : "Aula unica";

  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-base text-strong-light dark:text-strong-dark">
          {item.title}
        </Text>
        <Text className="text-xs text-muted-light dark:text-muted-dark">{weekday}</Text>
      </View>
      <Text className="text-xs text-muted-light dark:text-muted-dark">
        {formatTime(item.startTime)} - {formatTime(item.endTime)}
      </Text>
      {item.instructorName ? (
        <Text className="text-xs text-muted-light dark:text-muted-dark">
          Instrutor: {item.instructorName}
        </Text>
      ) : null}
      <Text className="text-xs text-muted-light dark:text-muted-dark">{recurrence}</Text>

      <View className="mt-2 flex-row gap-2">
        <Button label="Editar" variant="secondary" onPress={onEdit} className="flex-1" />
        <Button label="Remover" variant="ghost" onPress={onDelete} className="flex-1" />
      </View>
    </Card>
  );
}
