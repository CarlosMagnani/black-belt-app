import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import type { Academy } from "../../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";

export default function Profile() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    return profile?.email ?? "Aluno";
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

  const handleSignOut = async () => {
    try {
      await dojoFlowAdapters.auth.signOut();
      router.replace("/auth");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel sair.");
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[900px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Perfil
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Seus dados
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Informacoes da sua conta e da academia vinculada.
          </Text>

          {isBooting || isLoading ? (
            <Card className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando informacoes...
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
                Conta
              </Text>
              <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
                {displayName}
              </Text>
              <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                {profile?.email ?? "Email nao informado"}
              </Text>
              <View className="mt-4 self-start">
                <Badge label={profile?.currentBelt ?? "Branca"} variant="brand" />
              </View>
            </Card>

            <Card className="flex-1">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Academia
              </Text>
              <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
                {academy?.name ?? "Nao vinculada"}
              </Text>
              <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                {academy?.city ? academy.city : "Cidade nao informada"}
              </Text>
            </Card>
          </View>

          <View className="mt-6">
            <Button label="Sair da conta" variant="secondary" onPress={handleSignOut} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
