import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

import { dojoFlowAdapters } from "../src/infra/supabase/adapters";

export default function Index() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const resolveRoute = async () => {
      try {
        const session = await dojoFlowAdapters.auth.getSession();
        if (!session) {
          router.replace("/auth");
          return;
        }

        const profile = await dojoFlowAdapters.profiles.getProfile(session.user.id);
        if (!profile?.role) {
          router.replace("/onboarding");
          return;
        }

        if (profile.role === "student") {
          const memberships = await dojoFlowAdapters.memberships.listByUser(profile.id);
          if (memberships.length === 0) {
            router.replace("/join-academy");
            return;
          }
          router.replace("/student-home");
          return;
        }

        const academy = await dojoFlowAdapters.academies.getByOwnerId(profile.id);
        if (!academy) {
          router.replace("/create-academy");
          return;
        }
        router.replace("/create-academy");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar o app.");
        setStatus("error");
      }
    };

    void resolveRoute();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-5">
        {status === "loading" ? (
          <>
            <ActivityIndicator />
            <Text className="mt-3 text-sm text-slate-600">Carregando DojoFlow...</Text>
          </>
        ) : (
          <Text className="text-sm text-red-500">{error ?? "Erro inesperado."}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
