import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { WeekCalendar } from "../../components/calendar/WeekCalendar";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import type { Academy, CheckinStatus, ClassScheduleItem } from "../../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";

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
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  const [isAcademyLoading, setIsAcademyLoading] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [checkinStatusByClassId, setCheckinStatusByClassId] = useState<
    Record<string, CheckinStatus>
  >({});
  const [checkinLoadingId, setCheckinLoadingId] = useState<string | null>(null);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const weekEndISO = useMemo(() => toISODate(addDays(weekStart, 6)), [weekStart]);

  useEffect(() => {
    if (isBooting) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!profile?.role) {
      router.replace("/onboarding");
      return;
    }
    if (profile.role !== "student") {
      router.replace("/");
    }
  }, [isBooting, session, profile, router]);

  useEffect(() => {
    if (!profile?.id) return;
    if (profile.role !== "student") return;

    const loadAcademy = async () => {
      setIsAcademyLoading(true);
      setError(null);
      try {
        const memberships = await dojoFlowAdapters.memberships.listByUser(profile.id);
        if (memberships.length === 0) {
          router.replace("/join-academy");
          return;
        }
        setAcademyId(memberships[0].academyId);
        const academyData = await dojoFlowAdapters.academies.getById(memberships[0].academyId);
        setAcademy(academyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
      } finally {
        setIsAcademyLoading(false);
      }
    };

    void loadAcademy();
  }, [profile?.id, profile?.role, router]);

  useEffect(() => {
    if (!academyId) return;
    let isActive = true;

    const loadSchedule = async () => {
      setIsScheduleLoading(true);
      setError(null);
      try {
        const items = await dojoFlowAdapters.schedules.getWeeklySchedule(
          academyId,
          weekStartISO,
          weekEndISO
        );
        if (!isActive) return;
        setScheduleItems(items);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a agenda.");
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
    setError(null);
    try {
      await dojoFlowAdapters.checkins.createCheckin({
        academyId,
        classId: item.id,
        studentId: profile.id,
      });
      setCheckinStatusByClassId((prev) => ({ ...prev, [item.id]: "pending" }));
      setCheckinMessage("Check-in enviado para validacao.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel registrar o check-in.");
    } finally {
      setCheckinLoadingId(null);
    }
  };

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
