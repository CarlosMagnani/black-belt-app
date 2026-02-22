import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";

export default function Index() {
  const router = useRouter();
  const { isLoading, session, profile, role } = useAuthProfile();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    let isActive = true;

    const resolveRoute = async () => {
      try {
        if (!session) {
          router.replace("/auth");
          return;
        }

        const hasProfileName = !!profile?.firstName?.trim();
        const hasBelt = !!profile?.belt;
        if (!profile || !hasBelt || !hasProfileName) {
          router.replace("/onboarding");
          return;
        }

        if (role === "student") {
          const memberships = await blackBeltAdapters.memberships.listByUser(profile.id);
          if (!isActive) return;
          if (memberships.length === 0) {
            router.replace("/join-academy");
            return;
          }
          router.replace("/home");
          return;
        }

        if (role === "owner") {
          const academy = await blackBeltAdapters.academies.getByOwnerId(profile.id);
          if (!isActive) return;
          if (!academy) {
            router.replace("/create-academy");
            return;
          }
          router.replace("/owner-home");
          return;
        }

        if (role === "instructor") {
          router.replace("/professor-checkins");
          return;
        }

        router.replace("/onboarding");
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
  }, [isLoading, profile, role, router, session]);

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
