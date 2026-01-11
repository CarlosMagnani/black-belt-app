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
import { dojoFlowAdapters } from "../src/infra/supabase/adapters";

export default function JoinAcademy() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (inviteCode: string) => {
    if (!session) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const academy = await dojoFlowAdapters.academies.getByInviteCode(inviteCode);
      if (!academy) {
        setError("Codigo invalido. Verifique com o professor.");
        return;
      }
      await dojoFlowAdapters.memberships.addMember({
        academyId: academy.id,
        userId: session.user.id,
      });
      router.replace("/student-home");
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-50 opacity-80" />
      <View className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-slate-100 opacity-90" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
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

            <Text className="mt-6 font-display text-2xl text-ink">
              Conecte-se a sua academia
            </Text>
            <Text className="mt-2 text-base text-slate-600">
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
                <Text className="text-sm text-slate-500">Verificando seu perfil...</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
