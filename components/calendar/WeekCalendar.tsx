import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import type { ClassScheduleItem } from "../../src/core/ports/dojoflow-ports";
import { Card } from "../ui/Card";
import { ClassBlock } from "./ClassBlock";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const formatRange = (start: Date, end: Date) => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

type WeekCalendarProps = {
  weekStart: Date;
  items: ClassScheduleItem[];
  isLoading?: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

export function WeekCalendar({
  weekStart,
  items,
  isLoading = false,
  onPrevWeek,
  onNextWeek,
}: WeekCalendarProps) {
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const grouped = useMemo(() => {
    const map: Record<number, ClassScheduleItem[]> = {};
    for (const item of items) {
      if (!map[item.weekday]) map[item.weekday] = [];
      map[item.weekday].push(item);
    }
    return map;
  }, [items]);

  const days = useMemo(
    () =>
      WEEKDAY_ORDER.map((weekday, index) => ({
        weekday,
        label: WEEKDAY_LABELS[weekday],
        date: addDays(weekStart, index),
      })),
    [weekStart]
  );

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Semana
          </Text>
          <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
            {formatRange(weekStart, weekEnd)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={onPrevWeek}
            className="rounded-full border border-subtle-light bg-surface-light p-2 dark:border-subtle-dark dark:bg-surface-dark"
            style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
          >
            <ChevronLeft size={18} color="#94A3B8" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onNextWeek}
            className="rounded-full border border-subtle-light bg-surface-light p-2 dark:border-subtle-dark dark:bg-surface-dark"
            style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
          >
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <Card className="mt-6 flex-row items-center gap-3">
          <ActivityIndicator />
          <Text className="text-sm text-muted-light dark:text-muted-dark">
            Carregando agenda da semana...
          </Text>
        </Card>
      ) : items.length === 0 ? (
        <Card className="mt-6">
          <Text className="text-sm text-muted-light dark:text-muted-dark">
            Nenhuma aula cadastrada para esta semana.
          </Text>
        </Card>
      ) : (
        <View className="mt-6 gap-6 web:grid web:grid-cols-2 web:gap-6">
          {days.map((day) => {
            const list = grouped[day.weekday] ?? [];
            return (
              <Card key={day.weekday} className="p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="font-display text-base text-strong-light dark:text-strong-dark">
                    {day.label}
                  </Text>
                  <Text className="text-xs text-muted-light dark:text-muted-dark">
                    {day.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </Text>
                </View>
                {list.length === 0 ? (
                  <Text className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                    Sem aulas neste dia.
                  </Text>
                ) : (
                  <View className="mt-3 gap-3">
                    {list.map((item) => (
                      <ClassBlock key={item.id} item={item} />
                    ))}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
}
