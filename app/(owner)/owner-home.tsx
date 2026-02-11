import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";

import { HomeHeader } from "../../components/home/HomeHeader";
import { InviteCodeCard } from "../../components/owner/InviteCodeCard";
import { KpiCard } from "../../components/owner/KpiCard";
import { OverdueCounter } from "../../components/owner/OverdueCounter";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";

// Mock data for attendance rate calculation
// TODO: Replace with real check-in data when available
const calculateAttendanceRate = (membersCount: number): number => {
  if (membersCount === 0) return 0;
  // Mock: random between 60-95%
  return Math.round(60 + Math.random() * 35);
};

// Mock overdue count calculation
// TODO: Replace with real subscription data
const calculateOverdueCount = (membersCount: number): number => {
  if (membersCount === 0) return 0;
  // Mock: ~10-15% overdue
  return Math.round(membersCount * 0.12);
};

type MetricCardData = {
  key: string;
  label: string;
  value: string | number;
  helper?: string;
};

type ActionItem = {
  key: string;
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

const chunkItems = <T,>(items: T[], size: number): T[][] => {
  if (size <= 1) return items.map((item) => [item]);
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export default function OwnerHome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1180;
  const isTablet = width >= 760;
  const gridColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  const { academy, isLoading, error } = useOwnerAcademy();
  const { profile } = useAuthProfile();
  const [membersCount, setMembersCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const todayWeekday = useMemo(() => new Date().getDay(), []);

  // Calculated metrics
  const attendanceRate = useMemo(() => calculateAttendanceRate(membersCount), [membersCount]);
  const overdueCount = useMemo(() => calculateOverdueCount(membersCount), [membersCount]);

  const ownerFirstName = useMemo(() => {
    if (profile?.fullName?.trim()) return profile.fullName.trim().split(" ")[0] ?? "Mestre";
    if (profile?.email?.trim()) return profile.email.trim().split("@")[0] ?? "Mestre";
    return "Mestre";
  }, [profile?.email, profile?.fullName]);

  const metricCards = useMemo<MetricCardData[]>(
    () => [
      {
        key: "members",
        label: "Alunos ativos",
        value: isMetricsLoading ? "..." : membersCount,
        helper: "Total de alunos vinculados",
      },
      {
        key: "attendance",
        label: "Taxa de frequência",
        value: isMetricsLoading ? "..." : `${attendanceRate}%`,
        helper: "Últimos 30 dias",
      },
      {
        key: "overdue",
        label: "Inadimplentes",
        value: isMetricsLoading ? "..." : overdueCount,
        helper:
          membersCount > 0
            ? `${Math.round((overdueCount / membersCount) * 100)}% do total`
            : undefined,
      },
      {
        key: "pending",
        label: "Check-ins pendentes",
        value: isMetricsLoading ? "..." : pendingCount,
      },
      {
        key: "today",
        label: "Aulas hoje",
        value: isMetricsLoading ? "..." : todayCount,
        helper: isMetricsLoading ? undefined : `Semana: ${weekCount}`,
      },
    ],
    [
      attendanceRate,
      isMetricsLoading,
      membersCount,
      overdueCount,
      pendingCount,
      todayCount,
      weekCount,
    ]
  );

  const metricRows = useMemo<(MetricCardData | null)[][]>(() => {
    const rows = chunkItems(metricCards, gridColumns).map((row) => [...row] as (MetricCardData | null)[]);

    if (isDesktop && rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      if (lastRow.length < gridColumns) {
        const placeholders = Array.from({ length: gridColumns - lastRow.length }, () => null);
        rows[rows.length - 1] = [...lastRow, ...placeholders];
      }
    }

    return rows;
  }, [gridColumns, isDesktop, metricCards]);

  const actionItems: ActionItem[] = useMemo(
    () => [
      {
        key: "schedule",
        label: "Cadastrar aula",
        href: "/owner-schedule",
        variant: "primary",
      },
      {
        key: "students",
        label: "Ver alunos",
        href: "/owner-students",
        variant: "secondary",
      },
      {
        key: "checkins",
        label: "Validar check-ins",
        href: "/owner-checkins",
        variant: "secondary",
      },
      {
        key: "plans",
        label: "💳 Gerenciar planos",
        href: "/owner-plans",
        variant: "secondary",
      },
      {
        key: "professors",
        label: "👥 Professores",
        href: "/owner-professors",
        variant: "secondary",
      },
    ],
    []
  );

  const actionRows = useMemo<(ActionItem | null)[][]>(() => {
    const rows = chunkItems(actionItems, gridColumns).map((row) => [...row] as (ActionItem | null)[]);

    if (isDesktop && rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      if (lastRow.length < gridColumns) {
        const placeholders = Array.from({ length: gridColumns - lastRow.length }, () => null);
        rows[rows.length - 1] = [...lastRow, ...placeholders];
      }
    }

    return rows;
  }, [actionItems, gridColumns, isDesktop]);

  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadMetrics = async () => {
      setIsMetricsLoading(true);
      try {
        const [members, pending, classes] = await Promise.all([
          blackBeltAdapters.memberships.listByAcademy(academy.id),
          blackBeltAdapters.checkins.listPendingByAcademy(academy.id),
          blackBeltAdapters.classes.listByAcademy(academy.id),
        ]);
        if (!isActive) return;
        setMembersCount(members.length);
        setPendingCount(pending.length);
        setWeekCount(classes.length);
        setTodayCount(classes.filter((item) => item.weekday === todayWeekday).length);
      } catch {
        if (!isActive) return;
      } finally {
        if (isActive) setIsMetricsLoading(false);
      }
    };

    void loadMetrics();

    return () => {
      isActive = false;
    };
  }, [academy, todayWeekday]);

  const handleCopy = async () => {
    if (!academy?.inviteCode) return;
    if (Platform.OS === "web") {
      const clipboard = (globalThis as {
        navigator?: { clipboard?: { writeText: (value: string) => Promise<void> } };
      }).navigator?.clipboard;
      if (clipboard) {
        await clipboard.writeText(academy.inviteCode);
        setCopyMessage("Codigo copiado.");
      } else {
        setCopyMessage("Copie o codigo manualmente.");
      }
    } else {
      setCopyMessage("Copie o codigo manualmente.");
    }
    setTimeout(() => setCopyMessage(null), 2000);
  };

  return (
    <ScrollView className="flex-1">
      <View className="pb-10 pt-6">
        <View className="w-full px-page web:mx-auto web:max-w-6xl web:px-10">
          <View className="gap-1">
            <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
              Dashboard
            </Text>
            <Text className="font-display text-3xl text-strong-light dark:text-strong-dark">
              Ola, {ownerFirstName}
            </Text>
            <Text className="text-sm text-muted-light dark:text-muted-dark">
              Visão geral da academia e principais ações do dia.
            </Text>
          </View>

          <View className="mt-4">
            <HomeHeader
              displayName={profile?.fullName ?? profile?.email ?? "Mestre"}
              belt={profile?.currentBelt ?? "Preta"}
              beltDegree={profile?.beltDegree ?? null}
              userName={profile?.fullName ?? profile?.email ?? "Mestre"}
              userAvatarUrl={profile?.avatarUrl ?? null}
              academyName={academy?.name ?? "Academia"}
              academyLogoUrl={academy?.logoUrl ?? null}
            />
          </View>

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          {academy ? (
            <View className="mt-6 gap-2">
              <InviteCodeCard
                name={academy.name}
                city={academy.city}
                inviteCode={academy.inviteCode}
                logoUrl={academy.logoUrl}
                onCopy={handleCopy}
              />
              {copyMessage ? (
                <Text className="px-1 text-xs text-emerald-600">{copyMessage}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Overdue Alert */}
          {!isLoading && !isMetricsLoading && overdueCount > 0 && (
            <View className="mt-6">
              <OverdueCounter count={overdueCount} />
            </View>
          )}

          {/* KPIs */}
          <View className="mt-6 gap-4">
            {metricRows.map((row, rowIndex) => {
              const isMultiColumnRow = row.length > 1;
              return (
                <View
                  key={`kpi-row-${rowIndex}`}
                  className={isMultiColumnRow ? "flex-row gap-4" : ""}
                >
                  {row.map((metric, index) =>
                    metric ? (
                      <KpiCard
                        key={metric.key}
                        label={metric.label}
                        value={metric.value}
                        helper={metric.helper}
                        className={isMultiColumnRow ? "flex-1" : ""}
                      />
                    ) : (
                      <View key={`kpi-placeholder-${rowIndex}-${index}`} className="flex-1" />
                    )
                  )}
                </View>
              );
            })}
          </View>

          {/* Quick Actions */}
          <View className="mt-8">
            <Text className="mb-3 text-xs uppercase tracking-wide text-muted-light dark:text-muted-dark">
              Ações rápidas
            </Text>
            <View className="gap-3">
              {actionRows.map((row, rowIndex) => {
                const isMultiColumnRow = row.length > 1;
                return (
                  <View
                    key={`action-row-${rowIndex}`}
                    className={isMultiColumnRow ? "flex-row gap-3" : ""}
                  >
                    {row.map((action, index) =>
                      action ? (
                        <Button
                          key={action.key}
                          label={action.label}
                          variant={action.variant ?? "secondary"}
                          className={isMultiColumnRow ? "flex-1" : ""}
                          onPress={() => router.replace(action.href)}
                        />
                      ) : (
                        <View
                          key={`action-placeholder-${rowIndex}-${index}`}
                          className="flex-1"
                        />
                      )
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {isLoading ? (
            <Text className="mt-6 text-sm text-muted-light dark:text-muted-dark">
              Carregando dados do owner...
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
