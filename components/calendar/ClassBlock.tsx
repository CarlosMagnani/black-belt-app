import React from "react";
import { Text, View } from "react-native";
import { Clock, MapPin, User } from "lucide-react-native";

import type { CheckinStatus, ClassScheduleItem } from "../../src/core/ports/blackbelt-ports";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const formatTime = (value: string) => value.slice(0, 5);

type ClassBlockProps = {
  item: ClassScheduleItem;
  onCheckin?: () => void;
  checkinStatus?: CheckinStatus;
  isCheckinLoading?: boolean;
};

export function ClassBlock({
  item,
  onCheckin,
  checkinStatus,
  isCheckinLoading,
}: ClassBlockProps) {
  return (
    <View className="rounded-2xl border border-subtle-light bg-app-light p-4 dark:border-subtle-dark dark:bg-app-dark">
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
        <View className="mt-2 flex-row items-center gap-2">
          <User size={14} color="#94A3B8" />
          <Text className="text-xs text-muted-light dark:text-muted-dark">
            {item.instructorName}
          </Text>
        </View>
      ) : null}
      {item.location ? (
        <View className="mt-2 flex-row items-center gap-2">
          <MapPin size={14} color="#94A3B8" />
          <Text className="text-xs text-muted-light dark:text-muted-dark">{item.location}</Text>
        </View>
      ) : null}
      {item.level ? (
        <Text className="mt-2 text-xs text-muted-light dark:text-muted-dark">
          Nivel: {item.level}
        </Text>
      ) : null}
      {checkinStatus ? (
        <View className="mt-3 self-start">
          <Badge
            label={
              checkinStatus === "approved"
                ? "Check-in aprovado"
                : checkinStatus === "rejected"
                  ? "Check-in rejeitado"
                  : "Check-in pendente"
            }
            variant="outline"
          />
        </View>
      ) : onCheckin ? (
        <View className="mt-3">
          <Button
            label={isCheckinLoading ? "Enviando..." : "Fazer check-in"}
            size="sm"
            onPress={onCheckin}
            disabled={isCheckinLoading}
          />
        </View>
      ) : null}
    </View>
  );
}
