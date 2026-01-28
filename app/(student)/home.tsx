import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CalendarDays, QrCode } from "lucide-react-native";

import { ClassPreviewItem } from "../../components/home/ClassPreviewItem";
import { DayChips } from "../../components/home/DayChips";
import { HomeHeader } from "../../components/home/HomeHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import { useStudentProgress } from "../../src/core/hooks/use-student-progress";
import type { BeltName } from "../../src/core/belts/belts";
import type { Academy, ClassScheduleItem } from "../../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";
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

export default function StudentHome() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  const [isAcademyLoading, setIsAcademyLoading] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekday, setSelectedWeekday] = useState(() => new Date().getDay());

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName.split(" ")[0];
    if (profile?.email) return profile.email.split("@")[0];
    return "Aluno";
  }, [profile?.fullName, profile?.email]);

  const currentBelt: BeltName = profile?.currentBelt ?? "Branca";
  const beltDegree = profile?.beltDegree ?? undefined;
  const progress = useStudentProgress(currentBelt);
  const calendarIconColor = theme === "dark" ? "#E0E7FF" : "#1E3A8A";

  const weekStart = useMemo(() => getWeekStart(new Date()), []);
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

    let isActive = true;

    const loadAcademy = async () => {
      setIsAcademyLoading(true);
      setError(null);
      try {
        const memberships = await dojoFlowAdapters.memberships.listByUser(profile.id);
        if (!isActive) return;
        if (memberships.length === 0) {
          router.replace("/join-academy");
          return;
        }
        setAcademyId(memberships[0].academyId);
        const academyData = await dojoFlowAdapters.academies.getById(memberships[0].academyId);
        if (!isActive) return;
        setAcademy(academyData);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
      } finally {
        if (isActive) setIsAcademyLoading(false);
      }
    };

    void loadAcademy();

    return () => {
      isActive = false;
    };
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

  return (
    <ScrollView className="flex-1">
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

            {isBooting || isAcademyLoading || isScheduleLoading ? (
              <Card className="mt-4 flex-row items-center gap-3">
                <ActivityIndicator />
                <Text className="text-sm text-muted-light dark:text-muted-dark">
                  Carregando agenda da semana...
                </Text>
              </Card>
            ) : selectedItems.length === 0 ? (
              <Card className="mt-4">
                <Text className="text-sm text-muted-light dark:text-muted-dark">
                  Nenhuma aula cadastrada para este dia.
                </Text>
              </Card>
            ) : (
              <View className="mt-4 gap-3">
                {selectedItems.map((item) => (
                  <ClassPreviewItem key={item.id} item={item} />
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
  );
}
