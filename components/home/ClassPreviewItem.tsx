import React from "react";
import { Text, View } from "react-native";
import { Clock } from "lucide-react-native";

import type { ClassScheduleItem } from "../../src/core/ports/dojoflow-ports";
import { Badge } from "../ui/Badge";

type ClassPreviewItemProps = {
  item: ClassScheduleItem;
  statusLabel?: string;
};

const formatTime = (value: string) => value.slice(0, 5);

export function ClassPreviewItem({ item, statusLabel }: ClassPreviewItemProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-subtle-light bg-app-light p-3 dark:border-subtle-dark dark:bg-app-dark">
      <View className="flex-1 pr-4">
        <Text className="font-display text-base text-strong-light dark:text-strong-dark">
          {item.title}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Clock size={14} color="#94A3B8" />
          <Text className="text-xs text-muted-light dark:text-muted-dark">
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
        {item.instructorName ? (
          <Text className="mt-1 text-xs text-muted-light dark:text-muted-dark">
            Instrutor: {item.instructorName}
          </Text>
        ) : null}
      </View>
      {statusLabel ? <Badge label={statusLabel} variant="outline" /> : null}
    </View>
  );
}
