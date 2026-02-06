import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { JoinAcademyCard } from "../components/JoinAcademyCard";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";
import { useTheme } from "../src/ui/theme/ThemeProvider";

export default function JoinAcademy() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const iconColor = theme === "dark" ? "#E5E7EB" : "#0F172A";

  const handleSubmit = async (inviteCode: string) => {
    if (!session) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const academy = await blackBeltAdapters.academies.getByInviteCode(inviteCode);
      if (!academy) {
        setError("Codigo invalido. Verifique com o professor.");
        return;
      }
      await blackBeltAdapters.memberships.addMember({
        academyId: academy.id,
        userId: session.user.id,
      });
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel entrar na academia.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-50 opacity-80 dark:bg-brand-600/20" />
      <View className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-surface-light opacity-90 dark:bg-surface-dark dark:opacity-60" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView className="flex-1">
          <View className="px-5 pb-10">
            <View className="mx-auto w-full max-w-[520px]">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              className="mt-4 flex-row items-center gap-2 self-start"
            >
              <ArrowLeft size={18} color={iconColor} strokeWidth={2.2} />
              <Text className="text-sm text-strong-light dark:text-strong-dark">Voltar</Text>
            </Pressable>

            <Text className="mt-6 font-display text-2xl text-strong-light dark:text-strong-dark">
              Conecte-se a sua academia
            </Text>
            <Text className="mt-2 text-base text-muted-light dark:text-muted-dark">
              Assim que validar o codigo, seu perfil sera vinculado automaticamente.
            </Text>

            <View className="mt-6">
              <JoinAcademyCard
                isLoading={isSubmitting}
                onSubmit={handleSubmit}
                helperText="Seu professor compartilha o codigo com a turma."
                errorMessage={error}
              />
            </View>

            {isBooting ? (
              <View className="mt-5 flex-row items-center gap-3">
                <ActivityIndicator />
                <Text className="text-sm text-muted-light dark:text-muted-dark">
                  Verificando seu perfil...
                </Text>
              </View>
            ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
