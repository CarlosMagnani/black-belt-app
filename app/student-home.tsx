import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { dojoFlowAdapters } from "../src/infra/supabase/adapters";

export default function StudentHome() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academyName, setAcademyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const academy = await dojoFlowAdapters.academies.getById(memberships[0].academyId);
        setAcademyName(academy?.name ?? null);
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="flex-1 px-5">
        <View className="mx-auto w-full max-w-[520px]">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="mt-4 flex-row items-center gap-2 self-start"
          >
            <ArrowLeft size={18} color="#0F172A" strokeWidth={2.2} />
            <Text className="text-sm text-ink">Voltar</Text>
          </Pressable>

          <Text className="mt-6 font-display text-2xl text-ink">Seu progresso</Text>
          <Text className="mt-2 text-base text-slate-600">
            Acompanhe sua faixa e a academia vinculada.
          </Text>

          {isBooting || isLoading ? (
            <View className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-slate-500">Carregando informacoes...</Text>
            </View>
          ) : null}

          {error ? <Text className="mt-4 text-sm text-red-500">{error}</Text> : null}

          <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="text-xs uppercase tracking-widest text-slate-500">Academia</Text>
            <Text className="mt-2 font-display text-xl text-ink">
              {academyName ?? "Nao vinculada"}
            </Text>

            <Text className="mt-6 text-xs uppercase tracking-widest text-slate-500">Faixa</Text>
            <Text className="mt-2 font-display text-xl text-ink">
              {profile?.currentBelt ?? "Branca"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            className="mt-6 self-start rounded-xl border border-slate-200 px-4 py-2"
          >
            <Text className="text-sm text-slate-600">Sair</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
