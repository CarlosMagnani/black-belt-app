import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { WeekCalendar } from "../../components/calendar/WeekCalendar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useStudentAcademy } from "../../src/core/hooks/use-student-academy";
import type { CheckinStatus, ClassScheduleItem } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";

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
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [checkinStatusByClassId, setCheckinStatusByClassId] = useState<
    Record<string, CheckinStatus>
  >({});
  const [checkinLoadingId, setCheckinLoadingId] = useState<string | null>(null);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const weekEndISO = useMemo(() => toISODate(addDays(weekStart, 6)), [weekStart]);

  useEffect(() => {
    if (!academyId) return;
    let isActive = true;

    const loadSchedule = async () => {
      setIsScheduleLoading(true);
      setScheduleError(null);
      try {
        const items = await blackBeltAdapters.schedules.getWeeklySchedule(
          academyId,
          weekStartISO,
          weekEndISO
        );
        if (!isActive) return;
        setScheduleItems(items);
      } catch (err) {
        if (!isActive) return;
        setScheduleError(err instanceof Error ? err.message : "Nao foi possivel carregar a agenda.");
      } finally {
        if (isActive) setIsScheduleLoading(false);
      }
    };

    void loadSchedule();

    return () => {
      isActive = false;
    };
  }, [academyId, weekStartISO, weekEndISO]);

  const handleCheckin = async (item: ClassScheduleItem) => {
    if (!academyId || !profile?.id) return;
    setCheckinLoadingId(item.id);
    setCheckinMessage(null);
    setScheduleError(null);
    try {
      await blackBeltAdapters.checkins.createCheckin({
        academyId,
        classId: item.id,
        studentId: profile.id,
      });
      setCheckinStatusByClassId((prev) => ({ ...prev, [item.id]: "pending" }));
      setCheckinMessage("Check-in enviado para validacao.");
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "Nao foi possivel registrar o check-in.");
    } finally {
      setCheckinLoadingId(null);
    }
  };

  const error = academyError ?? scheduleError;

  return (
    <ScrollView className="flex-1">
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
          {checkinMessage ? (
            <Card className="mt-4">
              <Text className="text-sm text-emerald-600">{checkinMessage}</Text>
            </Card>
          ) : null}

          <View className="mt-6">
            <WeekCalendar
              weekStart={weekStart}
              items={scheduleItems}
              isLoading={isAcademyLoading || isScheduleLoading}
              onPrevWeek={() => setWeekStart((prev) => addDays(prev, -7))}
              onNextWeek={() => setWeekStart((prev) => addDays(prev, 7))}
              onCheckin={handleCheckin}
              checkinStatusByClassId={checkinStatusByClassId}
              checkinLoadingId={checkinLoadingId}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
