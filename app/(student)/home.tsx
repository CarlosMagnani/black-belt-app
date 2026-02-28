import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CalendarDays, QrCode } from "lucide-react-native";

import { ClassPreviewItem } from "../../components/home/ClassPreviewItem";
import { DayChips } from "../../components/home/DayChips";
import { HomeHeader } from "../../components/home/HomeHeader";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Skeleton } from "../../components/ui/Skeleton";
import { useStudentAcademy } from "../../src/core/hooks/use-student-academy";
import { useStudentProgress } from "../../src/core/hooks/use-student-progress";
import type { BeltName } from "../../src/core/belts/belts";
import type { ClassScheduleItem } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { showToast } from "../../src/core/utils/toast";
import { BeltProgressCard } from "../../src/ui/belts/BeltProgressCard";
import { useTheme } from "../../src/ui/theme/ThemeProvider";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

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

function ScheduleSkeleton() {
  return (
    <View className="mt-4 gap-3">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <View className="gap-2">
            <Skeleton height={14} width="60%" />
            <Skeleton height={12} width="40%" />
          </View>
        </Card>
      ))}
    </View>
  );
}

function ProgressSkeleton() {
  return (
    <View className="mt-6 gap-4 web:flex-row web:gap-6">
      <Card className="flex-1">
        <Skeleton height={12} width="50%" className="mb-2" />
        <Skeleton height={20} width="70%" className="mb-2" />
        <Skeleton height={8} borderRadius={4} />
      </Card>
      <Card className="flex-1">
        <Skeleton height={12} width="50%" className="mb-2" />
        <Skeleton height={20} width="70%" className="mb-2" />
        <Skeleton height={8} borderRadius={4} />
      </Card>
    </View>
  );
}

export default function StudentHome() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    isBooting,
    profile,
    membership,
    academy,
    academyId,
    isAcademyLoading,
    error: academyError,
    refreshProfile,
  } = useStudentAcademy();
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [selectedWeekday, setSelectedWeekday] = useState(() => new Date().getDay());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displayName = useMemo(() => {
    if (profile?.firstName) return profile.firstName.split(" ")[0];
    if (profile?.email) return profile.email.split("@")[0];
    return "Aluno";
  }, [profile?.firstName, profile?.email]);

  const currentBelt: BeltName = profile?.currentBelt ?? "Branca";
  const beltDegree = profile?.beltDegree ?? undefined;
  const progress = useStudentProgress(currentBelt, membership?.approvedClasses);
  const calendarIconColor = theme === "dark" ? "#E0E7FF" : "#1E3A8A";

  const [weekStart] = useState(() => getWeekStart(new Date()));
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const weekEndISO = useMemo(() => toISODate(addDays(weekStart, 6)), [weekStart]);

  const dayOptions = useMemo(
    () => WEEKDAY_ORDER.map((weekday) => ({ value: weekday, label: WEEKDAY_LABELS[weekday] })),
    []
  );

  const selectedItems = useMemo(
    () =>
      scheduleItems.filter((item) => item.weekday === selectedWeekday).slice(0, 4),
    [scheduleItems, selectedWeekday]
  );

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
    let isActive = true;

    void loadSchedule().then(() => {
      if (!isActive) return;
    });

    return () => {
      isActive = false;
    };
  }, [academyId, loadSchedule]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadSchedule(), refreshProfile?.()].filter(Boolean));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadSchedule, refreshProfile]);

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
        <View className="pb-10 pt-6">
          <View className="w-full px-page web:mx-auto web:max-w-6xl web:px-10">
            <HomeHeader
              displayName={displayName}
              belt={currentBelt}
              userName={profile?.fullName ?? profile?.email}
              userAvatarUrl={profile?.avatarUrl ?? null}
              academyName={academy?.name ?? "Academia"}
              academyLogoUrl={academy?.logoUrl ?? null}
              beltDegree={beltDegree}
            />

            {error ? (
              <Card className="mt-6" variant="outline">
                <Text className="text-sm text-red-500">{error}</Text>
              </Card>
            ) : null}

            {isLoading ? (
              <ProgressSkeleton />
            ) : (
              <View className="mt-6 gap-4 web:flex-row web:gap-6">
                <BeltProgressCard
                  title="Proximo grau"
                  value={`${progress.classesThisGrade} / ${progress.classesNeededGrade} Aulas`}
                  helper={`${progress.classesRemaining} para o proximo grau`}
                  progress={progress.gradeProgress}
                  className="flex-1"
                />
                <BeltProgressCard
                  title={`Rumo a faixa ${progress.nextBelt}`}
                  value={`${progress.totalClasses} Aulas totais`}
                  helper="Mantenha a consistencia semanal."
                  progress={progress.totalProgress}
                  className="flex-1"
                />
              </View>
            )}

            <View className="mt-6">
              <Button
                onPress={() => router.push("/schedule")}
                className="flex-row items-center justify-center gap-2 py-4"
              >
                <QrCode size={18} color="#FFFFFF" />
                <Text className="font-body text-sm text-white">Fazer check-in no tatame</Text>
              </Button>
            </View>

            <View className="mt-8">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <CalendarDays size={18} color={calendarIconColor} />
                  <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
                    Grade de Horarios
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/schedule")}
                  style={({ pressed }) => (pressed ? { opacity: 0.8 } : undefined)}
                >
                  <Text className="text-sm text-brand-700 dark:text-brand-50">
                    Ver agenda completa
                  </Text>
                </Pressable>
              </View>

              <DayChips
                days={dayOptions}
                selected={selectedWeekday}
                onSelect={setSelectedWeekday}
              />

              {isLoading || isScheduleLoading ? (
                <ScheduleSkeleton />
              ) : selectedItems.length === 0 ? (
                <Card className="mt-4 items-center py-8" animate>
                  <CalendarDays size={32} color="#94A3B8" />
                  <Text className="mt-3 text-sm text-muted-light dark:text-muted-dark">
                    Nenhuma aula cadastrada para este dia.
                  </Text>
                </Card>
              ) : (
                <View className="mt-4 gap-3">
                  {selectedItems.map((item, index) => (
                    <AnimatedListItem key={item.id} index={index}>
                      <ClassPreviewItem item={item} />
                    </AnimatedListItem>
                  ))}
                </View>
              )}

              {academy?.name ? (
                <Text className="mt-4 text-xs text-muted-light dark:text-muted-dark">
                  Agenda de {academy.name}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}
