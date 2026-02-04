import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { InviteCodeCard } from "../../components/owner/InviteCodeCard";
import { KpiCard } from "../../components/owner/KpiCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";

export default function OwnerHome() {
  const router = useRouter();
  const { academy, isLoading, error } = useOwnerAcademy();
  const [membersCount, setMembersCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const todayWeekday = useMemo(() => new Date().getDay(), []);

  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadMetrics = async () => {
      setIsMetricsLoading(true);
      try {
        const [members, pending, classes] = await Promise.all([
          dojoFlowAdapters.memberships.listByAcademy(academy.id),
          dojoFlowAdapters.checkins.listPendingByAcademy(academy.id),
          dojoFlowAdapters.classes.listByAcademy(academy.id),
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
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Dashboard
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Painel do owner
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Visao geral da academia e acessos rapidos.
          </Text>

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

          <View className="mt-6 gap-4 web:flex-row">
            <KpiCard
              label="Alunos vinculados"
              value={isMetricsLoading ? "..." : membersCount}
              className="flex-1"
            />
            <KpiCard
              label="Check-ins pendentes"
              value={isMetricsLoading ? "..." : pendingCount}
              className="flex-1"
            />
            <KpiCard
              label="Proximas aulas"
              value={isMetricsLoading ? "..." : todayCount}
              helper={isMetricsLoading ? undefined : `Semana: ${weekCount}`}
              className="flex-1"
            />
          </View>

          <View className="mt-6 gap-3 web:flex-row">
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
