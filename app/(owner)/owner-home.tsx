import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
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

export default function OwnerHome() {
  const router = useRouter();
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
      const clipboard = (globalThis as { navigator?: { clipboard?: { writeText: (value: string) => Promise<void> } } })
        .navigator?.clipboard;
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
          <HomeHeader
            displayName={profile?.fullName ?? profile?.email ?? "Mestre"}
            belt={profile?.currentBelt ?? 'Preta'}
            beltDegree={profile?.beltDegree ?? null}
            userName={profile?.fullName ?? profile?.email ?? "Mestre"}
            userAvatarUrl={profile?.avatarUrl ?? null}
            academyName={academy?.name ?? "Academia"}
            academyLogoUrl={academy?.logoUrl ?? null}
          />

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          {academy ? (
            <View className="mt-6 gap-4">
              <InviteCodeCard
                name={academy.name}
                city={academy.city}
                inviteCode={academy.inviteCode}
                logoUrl={academy.logoUrl}
                onCopy={handleCopy}
              />
              {copyMessage ? (
                <Text className="text-xs text-emerald-600">{copyMessage}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Overdue Alert */}
          {!isLoading && !isMetricsLoading && overdueCount > 0 && (
            <View className="mt-6">
              <OverdueCounter count={overdueCount} />
            </View>
          )}

          {/* Main KPIs */}
          <View className="mt-6 gap-4 web:flex-row">
            <KpiCard
              label="Alunos ativos"
              value={isMetricsLoading ? "..." : membersCount}
              helper="Total de alunos vinculados"
              className="flex-1"
            />
            <KpiCard
              label="Taxa de frequência"
              value={isMetricsLoading ? "..." : `${attendanceRate}%`}
              helper="Últimos 30 dias"
              className="flex-1"
            />
            <KpiCard
              label="Inadimplentes"
              value={isMetricsLoading ? "..." : overdueCount}
              helper={membersCount > 0 ? `${Math.round((overdueCount / membersCount) * 100)}% do total` : undefined}
              className="flex-1"
            />
          </View>

          {/* Secondary KPIs */}
          <View className="mt-4 gap-4 web:flex-row">
            <KpiCard
              label="Check-ins pendentes"
              value={isMetricsLoading ? "..." : pendingCount}
              className="flex-1"
            />
            <KpiCard
              label="Aulas hoje"
              value={isMetricsLoading ? "..." : todayCount}
              helper={isMetricsLoading ? undefined : `Semana: ${weekCount}`}
              className="flex-1"
            />
          </View>

          {/* Quick Actions */}
          <View className="mt-6">
            <Text className="mb-3 text-xs uppercase tracking-wide text-muted-light dark:text-muted-dark">
              Ações rápidas
            </Text>
            <View className="gap-3 web:flex-row">
              <Button
                label="Cadastrar aula"
                className="flex-1"
                onPress={() => router.replace("/owner-schedule")}
              />
              <Button
                label="Ver alunos"
                variant="secondary"
                className="flex-1"
                onPress={() => router.replace("/owner-students")}
              />
              <Button
                label="Validar check-ins"
                variant="secondary"
                className="flex-1"
                onPress={() => router.replace("/owner-checkins")}
              />
            </View>
          </View>

          {/* Secondary Actions */}
          <View className="mt-4">
            <View className="gap-3 web:flex-row">
              <Button
                label="💳 Gerenciar planos"
                variant="secondary"
                className="flex-1"
                onPress={() => router.replace("/owner-plans")}
              />
              <Button
                label="👥 Professores"
                variant="secondary"
                className="flex-1"
                onPress={() => router.replace("/owner-professors")}
              />
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
