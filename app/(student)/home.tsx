import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import type { Academy } from "../../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";

export default function StudentHome() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName.split(" ")[0];
    if (profile?.email) return profile.email.split("@")[0];
    return "Aluno";
  }, [profile?.fullName, profile?.email]);

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
      setIsLoading(true);
      setError(null);
      try {
        const memberships = await dojoFlowAdapters.memberships.listByUser(profile.id);
        if (memberships.length === 0) {
          router.replace("/join-academy");
          return;
        }
        const academyData = await dojoFlowAdapters.academies.getById(memberships[0].academyId);
        setAcademy(academyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAcademy();
  }, [profile?.id, profile?.role, router]);

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Bem-vindo
          </Text>
          <View className="mt-2 flex-row items-center gap-3">
            <Text className="font-display text-3xl text-strong-light dark:text-strong-dark">
              Ola, {displayName}
            </Text>
            <Badge label={profile?.currentBelt ?? "Branca"} variant="brand" />
          </View>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Acompanhe sua evolucao e visualize a agenda semanal da academia.
          </Text>

          {isBooting || isLoading ? (
            <Card className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando seus dados...
              </Text>
            </Card>
          ) : null}

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          <View className="mt-6 gap-4 web:flex-row">
            <Card className="flex-1">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Academia
              </Text>
              <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
                {academy?.name ?? "Nao vinculada"}
              </Text>
              <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                {academy?.city ? `Cidade: ${academy.city}` : "Sem cidade informada"}
              </Text>
              <Button
                label="Ver agenda"
                className="mt-4"
                onPress={() => router.push("/schedule")}
              />
            </Card>

            <Card className="flex-1">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Sua faixa
              </Text>
              <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
                {profile?.currentBelt ?? "Branca"}
              </Text>
              <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                Atualize seu perfil e acompanhe a evolucao registrada pelo professor.
              </Text>
              <Button
                label="Abrir perfil"
                variant="secondary"
                className="mt-4"
                onPress={() => router.push("/profile")}
              />
            </Card>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
