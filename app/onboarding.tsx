import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from "react-native";
import { GraduationCap, Users } from "lucide-react-native";

import { RoleCard } from "../components/RoleCard";
import type { UserRole } from "../src/core/ports/dojoflow-ports";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { dojoFlowAdapters } from "../src/infra/supabase/adapters";

export default function Onboarding() {
  const router = useRouter();
  const { isLoading, session, profile, error } = useAuthProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (profile?.role) {
      router.replace("/");
    }
  }, [isLoading, session, profile, router]);

  const handleRoleSelect = async (role: UserRole) => {
    if (!session) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await dojoFlowAdapters.profiles.upsertProfile({
        id: session.user.id,
        email: session.user.email,
        role,
      });
      router.replace("/");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Nao foi possivel salvar seu perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-50 opacity-80 dark:bg-brand-600/20" />
      <View className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-surface-light opacity-90 dark:bg-surface-dark dark:opacity-60" />

      <ScrollView className="flex-1">
        <View className="px-5 pb-10">
          <View className="mx-auto mt-8 w-full max-w-[520px]">
          <Text className="text-xs uppercase tracking-[4px] text-brand-600 dark:text-brand-50">
            DojoFlow
          </Text>
          <Text className="mt-3 font-display text-3xl text-strong-light dark:text-strong-dark">
            Comece em minutos
          </Text>
          <Text className="mt-2 text-base text-muted-light dark:text-muted-dark">
            Escolha como voce usa o DojoFlow hoje.
          </Text>

          <View className="mt-8">
            <RoleCard
              title="Professor / Dono"
              description="Crie sua academia, gere convites e gerencie faixas."
              icon={GraduationCap}
              accent="brand"
              onPress={() => {
                if (isSaving) return;
                void handleRoleSelect("professor");
              }}
            />
            <View className="mt-4">
              <RoleCard
                title="Aluno"
                description="Entre com o codigo da sua academia e acompanhe sua faixa."
                icon={Users}
                onPress={() => {
                  if (isSaving) return;
                  void handleRoleSelect("student");
                }}
              />
            </View>
          </View>

          {isLoading || isSaving ? (
            <View className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Preparando seu perfil...
              </Text>
            </View>
          ) : null}

          {error ? <Text className="mt-4 text-sm text-red-500">{error}</Text> : null}
          {saveError ? <Text className="mt-2 text-sm text-red-500">{saveError}</Text> : null}

          <Text className="mt-6 text-sm text-muted-light dark:text-muted-dark">
            Fluxo simples, poucos cliques para comecar.
          </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
