import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

import { blackBeltAdapters } from "../src/infra/supabase/adapters";

export default function Index() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const resolveRoute = async () => {
      try {
        const session = await blackBeltAdapters.auth.getSession();
        if (!session) {
          router.replace("/auth");
          return;
        }

        const profile = await blackBeltAdapters.profiles.getProfile(session.user.id);
        if (!profile?.role) {
          router.replace("/onboarding");
          return;
        }

        if (profile.role === "student") {
          const memberships = await blackBeltAdapters.memberships.listByUser(profile.id);
          if (memberships.length === 0) {
            router.replace("/join-academy");
            return;
          }
          router.replace("/home");
          return;
        }

        const academy = await blackBeltAdapters.academies.getByOwnerId(profile.id);
        if (!academy) {
          router.replace("/create-academy");
          return;
        }
        router.replace("/owner-home");
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
    <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="flex-1 items-center justify-center px-5">
        {status === "loading" ? (
          <>
            <ActivityIndicator />
            <Text className="mt-3 text-sm text-muted-light dark:text-muted-dark">
              Carregando BlackBelt...
            </Text>
          </>
        ) : (
          <Text className="text-sm text-red-500">{error ?? "Erro inesperado."}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
