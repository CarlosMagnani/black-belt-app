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
import { LinearGradient } from "expo-linear-gradient";
import { GraduationCap, Users, ChevronLeft, ChevronRight } from "lucide-react-native";

import { Avatar } from "../components/ui/Avatar";
import { BeltSelector } from "../components/ui/BeltSelector";
import { DateInput } from "../components/ui/DateInput";
import { DegreeSelector } from "../components/ui/DegreeSelector";
import { RoleCard } from "../components/RoleCard";
import { TextField } from "../components/ui/TextField";
import type { UserRole, Sex } from "../src/core/ports/blackbelt-ports";
import type { BeltName } from "../src/core/belts/belts";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";
import { supabase } from "../src/infra/supabase/client";

const TOTAL_STEPS = 4;

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: "M", value: "M" },
  { label: "F", value: "F" },
  { label: "Outro", value: "O" },
];

type OnboardingData = {
  role: UserRole | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: Sex | null;
  avatarUri: string;
  avatarUrl: string;
  belt: BeltName;
  degree: number;
};

const initialData: OnboardingData = {
  role: null,
  firstName: "",
  lastName: "",
  birthDate: "",
  sex: null,
  avatarUri: "",
  avatarUrl: "",
  belt: "Branca",
  degree: 0,
};

export default function Onboarding() {
  const router = useRouter();
  const { isLoading, session, profile, error } = useAuthProfile();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    // If profile is complete, go to appropriate route
    if (profile?.role && profile?.firstName && profile?.currentBelt) {
      if (profile.role === "student") {
        router.replace("/join-academy");
      } else {
        router.replace("/create-academy");
      }
    }
  }, [isLoading, session, profile, router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleAvatarSelected = async (localUri: string) => {
    if (!session?.user.id) return;
    
    setIsUploading(true);
    setSaveError(null);
    updateData({ avatarUri: localUri });

    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      
      const fileExt = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileName = `${session.user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      updateData({ avatarUrl: publicUrl });
    } catch (err) {
      console.error("Upload error:", err);
      setSaveError("Não foi possível fazer upload da foto. Tente novamente.");
      updateData({ avatarUri: "" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = async () => {
    if (!session?.user.id) return;
    
    setIsSaving(true);
    setSaveError(null);

    try {
      await blackBeltAdapters.profiles.upsertProfile({
        id: session.user.id,
        email: session.user.email,
        role: data.role,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        birthDate: data.birthDate || null,
        sex: data.sex,
        avatarUrl: data.avatarUrl || null,
        currentBelt: data.belt,
        beltDegree: data.degree,
      });

      // Redirect based on role
      if (data.role === "student") {
        router.replace("/join-academy");
      } else {
        router.replace("/create-academy");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Não foi possível salvar seu perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return data.role !== null;
      case 2:
        return (
          data.firstName.trim().length > 0 &&
          data.lastName.trim().length > 0 &&
          data.birthDate.length > 0 &&
          data.sex !== null
        );
      case 3:
        return data.belt !== null;
      case 4:
        return true; // Avatar is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Progress bar
  const renderProgress = () => (
    <View className="mb-6 flex-row gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < step ? "bg-brand-500" : "bg-subtle-dark"
          }`}
        />
      ))}
    </View>
  );

  // Step 1: Role Selection
  const renderStep1 = () => (
    <View>
      <Text className="text-2xl font-bold text-text-primary-dark">
        Como você vai usar o BlackBelt?
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Escolha seu perfil para personalizar sua experiência.
      </Text>

      <View className="mt-8 gap-4">
        <RoleCard
          title="Sou Professor / Dono"
          description="Crie sua academia, gere códigos de convite e gerencie seus alunos."
          icon={GraduationCap}
          accent="brand"
          selected={data.role === "professor"}
          onPress={() => updateData({ role: "professor" })}
        />
        <RoleCard
          title="Sou Aluno"
          description="Entre com o código da academia e acompanhe seu progresso."
          icon={Users}
          selected={data.role === "student"}
          onPress={() => updateData({ role: "student" })}
        />
      </View>
    </View>
  );

  // Step 2: Personal Data
  const renderStep2 = () => (
    <View>
      <Text className="text-2xl font-bold text-text-primary-dark">
        Dados pessoais
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Preencha suas informações básicas.
      </Text>

      <View className="mt-6 gap-5">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Primeiro nome"
              value={data.firstName}
              onChangeText={(v) => updateData({ firstName: v })}
              placeholder="Seu nome"
              autoCapitalize="words"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Sobrenome"
              value={data.lastName}
              onChangeText={(v) => updateData({ lastName: v })}
              placeholder="Sobrenome"
              autoCapitalize="words"
            />
          </View>
        </View>

        <DateInput
          label="Data de nascimento"
          value={data.birthDate}
          onChangeDate={(v) => updateData({ birthDate: v })}
        />

        {/* Sex selector as chips */}
        <View>
          <Text className="mb-3 text-xs uppercase tracking-widest text-text-muted-dark">
            Sexo
          </Text>
          <View className="flex-row gap-3">
            {SEX_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => updateData({ sex: option.value })}
                className={[
                  "flex-1 py-3.5 rounded-xl border",
                  data.sex === option.value
                    ? "border-brand-500 bg-brand-500/20"
                    : "border-subtle-dark bg-surface-dark",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-center font-medium",
                    data.sex === option.value
                      ? "text-brand-400"
                      : "text-text-secondary-dark",
                  ].join(" ")}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // Step 3: Belt and Degree
  const renderStep3 = () => (
    <View>
      <Text className="text-2xl font-bold text-text-primary-dark">
        Sua faixa
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Selecione sua faixa atual e quantidade de graus.
      </Text>

      <View className="mt-8">
        <BeltSelector
          label="Faixa"
          value={data.belt}
          onSelect={(v) => updateData({ belt: v, degree: 0 })}
        />
      </View>

      <View className="mt-8">
        <DegreeSelector
          label="Graus"
          value={data.degree}
          belt={data.belt}
          onSelect={(v) => updateData({ degree: v })}
        />
      </View>
    </View>
  );

  // Step 4: Avatar
  const renderStep4 = () => (
    <View className="items-center">
      <Text className="text-2xl font-bold text-text-primary-dark text-center">
        Foto de perfil
      </Text>
      <Text className="mt-2 text-text-secondary-dark text-center">
        Adicione uma foto para que outros praticantes te reconheçam.
      </Text>

      <View className="mt-10">
        <Avatar
          uri={data.avatarUri || data.avatarUrl}
          name={`${data.firstName} ${data.lastName}`}
          size="xl"
          editable
          onImageSelected={handleAvatarSelected}
        />
      </View>

      {isUploading && (
        <View className="mt-4 flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text className="text-sm text-brand-400">Enviando foto...</Text>
        </View>
      )}

      {data.avatarUrl && !isUploading && (
        <Text className="mt-4 text-sm text-success-dark">✓ Foto salva!</Text>
      )}

      <Pressable
        onPress={() => {
          // Trigger avatar picker
          const avatar = document.querySelector('[data-avatar-picker]');
          if (avatar) (avatar as HTMLElement).click();
        }}
        className="mt-6 py-3 px-6 rounded-xl border border-subtle-dark bg-surface-dark"
      >
        <Text className="text-brand-400 font-medium">Escolher foto</Text>
      </Pressable>

      <Text className="mt-4 text-center text-xs text-text-muted-dark">
        Você pode pular e adicionar depois
      </Text>

      {/* Summary card */}
      <View className="mt-8 w-full rounded-2xl bg-surface-dark-elevated border border-subtle-dark p-5">
        <Text className="text-sm font-medium text-text-primary-dark mb-3">
          📋 Resumo do seu perfil
        </Text>
        <View className="gap-1.5">
          <Text className="text-sm text-text-secondary-dark">
            <Text className="text-text-muted-dark">Nome: </Text>
            {data.firstName} {data.lastName}
          </Text>
          <Text className="text-sm text-text-secondary-dark">
            <Text className="text-text-muted-dark">Faixa: </Text>
            {data.belt} {data.degree > 0 ? `(${data.degree} graus)` : ""}
          </Text>
          <Text className="text-sm text-text-secondary-dark">
            <Text className="text-text-muted-dark">Perfil: </Text>
            {data.role === "professor" ? "Professor/Dono" : "Aluno"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-app-dark">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-dark">
      {/* Background effects */}
      <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/15" />
      <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-6 py-6">
            <View className="mx-auto w-full max-w-[500px]">
              {/* Header */}
              <Text className="text-xs uppercase tracking-[4px] text-brand-400">
                Passo {step} de {TOTAL_STEPS}
              </Text>

              {/* Progress */}
              <View className="mt-4">{renderProgress()}</View>

              {/* Content */}
              <View className="mt-4">{renderCurrentStep()}</View>

              {/* Error */}
              {(error || saveError) && (
                <View className="mt-4 rounded-xl bg-error-dark/20 p-4">
                  <Text className="text-sm text-error-dark">
                    {error || saveError}
                  </Text>
                </View>
              )}

              {/* Navigation */}
              <View className="mt-8 flex-row gap-3">
                {step > 1 && (
                  <Pressable
                    onPress={handleBack}
                    disabled={isSaving}
                    className="flex-row items-center justify-center gap-1 px-5 py-4 rounded-xl border border-subtle-dark bg-surface-dark"
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <ChevronLeft size={18} color="#F8FAFC" />
                    <Text className="text-text-primary-dark font-medium">Voltar</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleNext}
                  disabled={!canProceed() || isSaving || isUploading}
                  className="flex-1 overflow-hidden rounded-xl"
                  style={({ pressed }) => ({
                    opacity: pressed && canProceed() ? 0.9 : 1,
                  })}
                >
                  <LinearGradient
                    colors={
                      canProceed() && !isSaving && !isUploading
                        ? ["#7C3AED", "#6366F1"]
                        : ["#374151", "#374151"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center gap-1 px-6 py-4"
                  >
                    <Text
                      className={[
                        "font-semibold",
                        canProceed() ? "text-white" : "text-text-muted-dark",
                      ].join(" ")}
                    >
                      {isSaving
                        ? "Salvando..."
                        : step === TOTAL_STEPS
                        ? "Finalizar"
                        : "Continuar"}
                    </Text>
                    {step < TOTAL_STEPS && canProceed() && (
                      <ChevronRight size={18} color="#fff" />
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
