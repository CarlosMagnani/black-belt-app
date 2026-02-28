import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { WeekCalendar } from "../../components/calendar/WeekCalendar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Skeleton } from "../../components/ui/Skeleton";
import { useStudentAcademy } from "../../src/core/hooks/use-student-academy";
import type { CheckinStatus, ClassScheduleItem } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { showToast } from "../../src/core/utils/toast";
import { hapticSuccess } from "../../src/core/utils/haptics";

const getWeekStart = (date: Date) => {
  const day = date.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const toISODate = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

function CalendarSkeleton() {
  return (
    <Card className="mt-6 gap-3">
      <View className="flex-row justify-between">
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
      </View>
      <View className="flex-row gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width={40} height={60} borderRadius={8} className="flex-1" />
        ))}
      </View>
      {[0, 1, 2].map((i) => (
        <Skeleton key={`row-${i}`} height={48} />
      ))}
    </Card>
  );
}

export default function Schedule() {
  const {
    isBooting,
    profile,
    academy,
    academyId,
    isAcademyLoading,
    error: academyError,
  } = useStudentAcademy();
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [checkinStatusByClassId, setCheckinStatusByClassId] = useState<
    Record<string, CheckinStatus>
  >({});
  const [checkinLoadingId, setCheckinLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const weekEndISO = useMemo(() => toISODate(addDays(weekStart, 6)), [weekStart]);

  const loadSchedule = useCallback(async () => {
    if (!academyId) return;
    setIsScheduleLoading(true);
    try {
      const items = await blackBeltAdapters.schedules.getWeeklySchedule(
        academyId,
        weekStartISO,
        weekEndISO
      );
      setScheduleItems(items);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Nao foi possivel carregar a agenda.",
        variant: "error",
      });
    } finally {
      setIsScheduleLoading(false);
    }
  }, [academyId, weekStartISO, weekEndISO]);

  useEffect(() => {
    if (!academyId) return;
    void loadSchedule();
  }, [academyId, loadSchedule]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSchedule();
    setIsRefreshing(false);
  }, [loadSchedule]);

  const handleCheckin = async (item: ClassScheduleItem) => {
    if (!academyId || !profile?.id) return;
    setCheckinLoadingId(item.id);
    try {
      await blackBeltAdapters.checkins.createCheckin({
        academyId,
        classId: item.id,
        studentId: profile.id,
      });
      setCheckinStatusByClassId((prev) => ({ ...prev, [item.id]: "pending" }));
      void hapticSuccess();
      showToast({ message: "Check-in enviado para validacao.", variant: "success" });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Nao foi possivel registrar o check-in.",
        variant: "error",
      });
    } finally {
      setCheckinLoadingId(null);
    }
  };

  const error = academyError;
  const isLoading = isBooting || isAcademyLoading;

  return (
    <ErrorBoundary>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="px-page pb-10 pt-6 web:px-10">
          <View className="mx-auto w-full max-w-[1100px]">
            <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
              Agenda semanal
            </Text>
            <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
              Sua programacao de aulas
            </Text>
            <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
              Visualize os treinos recorrentes da semana e planeje sua rotina.
            </Text>

            {academy?.name ? (
              <View className="mt-4 self-start">
                <Badge label={academy.name} variant="neutral" />
              </View>
            ) : null}

            {error ? (
              <Card className="mt-6" variant="outline">
                <Text className="text-sm text-red-500">{error}</Text>
              </Card>
            ) : null}

            {isLoading || isScheduleLoading ? (
              <CalendarSkeleton />
            ) : (
              <View className="mt-6">
                <WeekCalendar
                  weekStart={weekStart}
                  items={scheduleItems}
                  isLoading={false}
                  onPrevWeek={() => setWeekStart((prev) => addDays(prev, -7))}
                  onNextWeek={() => setWeekStart((prev) => addDays(prev, 7))}
                  onCheckin={handleCheckin}
                  checkinStatusByClassId={checkinStatusByClassId}
                  checkinLoadingId={checkinLoadingId}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}
