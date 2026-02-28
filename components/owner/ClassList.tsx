import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { BarChart3, CalendarDays, Inbox } from "lucide-react-native";

import type { AcademyClass } from "../../src/core/ports/blackbelt-ports";
import { ClassCard } from "./ClassCard";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { useTheme } from "../../src/ui/theme/ThemeProvider";
import { getIconColor } from "../../src/ui/theme/icon-colors";

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

type ClassListProps = {
  classes: AcademyClass[];
  onEdit: (item: AcademyClass) => void;
  onDelete: (item: AcademyClass) => void;
  isLoading?: boolean;
};

type GroupedClasses = {
  weekday: number;
  name: string;
  classes: AcademyClass[];
};

export function ClassList({ classes, onEdit, onDelete, isLoading }: ClassListProps) {
  const { theme } = useTheme();
  const iconColor = getIconColor(theme, "muted");

  const grouped = useMemo(() => {
    // Sort classes by weekday and start time
    const sorted = [...classes].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.startTime.localeCompare(b.startTime);
    });

    // Group by weekday
    const groups: Map<number, AcademyClass[]> = new Map();
    sorted.forEach((cls) => {
      const existing = groups.get(cls.weekday) ?? [];
      groups.set(cls.weekday, [...existing, cls]);
    });

    // Convert to array with metadata
    const result: GroupedClasses[] = [];
    groups.forEach((classesInDay, weekday) => {
      result.push({
        weekday,
        name: WEEKDAY_NAMES[weekday] ?? `Dia ${weekday}`,
        classes: classesInDay,
      });
    });

    return result;
  }, [classes]);

  if (isLoading) {
    return (
      <View className="mt-6 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton height={16} width="40%" />
            <View className="mt-3 gap-2">
              <Skeleton height={60} width="100%" borderRadius={12} />
            </View>
          </Card>
        ))}
      </View>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="mt-6 items-center py-8">
        <Inbox size={40} color={iconColor} strokeWidth={1.5} />
        <Text className="mt-3 text-center font-display text-lg text-strong-light dark:text-strong-dark">
          Nenhuma aula cadastrada
        </Text>
        <Text className="mt-1 text-center text-sm text-muted-light dark:text-muted-dark">
          Clique em "Nova Aula" para criar a primeira aula da sua academia.
        </Text>
      </Card>
    );
  }

  return (
    <View className="mt-6 gap-6">
      {grouped.map((group) => (
        <View key={group.weekday}>
          {/* Day Header */}
          <View className="mb-3 flex-row items-center gap-2">
            <CalendarDays size={18} color={iconColor} strokeWidth={2} />
            <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
              {group.name}
            </Text>
            <View className="ml-2 rounded-full bg-brand-600/20 px-2 py-0.5">
              <Text className="text-xs font-semibold text-brand-400">
                {group.classes.length} {group.classes.length === 1 ? "aula" : "aulas"}
              </Text>
            </View>
          </View>

          {/* Classes for this day */}
          <View className="gap-3">
            {group.classes.map((item) => (
              <ClassCard
                key={item.id}
                item={item}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Summary */}
      <Card variant="outline" className="mt-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <BarChart3 size={14} color={iconColor} strokeWidth={2} />
            <Text className="text-sm text-muted-light dark:text-muted-dark">
              Total de aulas cadastradas
            </Text>
          </View>
          <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
            {classes.length}
          </Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <CalendarDays size={14} color={iconColor} strokeWidth={2} />
            <Text className="text-sm text-muted-light dark:text-muted-dark">
              Dias com aulas
            </Text>
          </View>
          <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
            {grouped.length}
          </Text>
        </View>
      </Card>
    </View>
  );
}
