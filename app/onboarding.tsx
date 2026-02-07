import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { GraduationCap, Users, ChevronLeft, ChevronRight } from "lucide-react-native";

import { Avatar } from "../components/ui/Avatar";
import { BeltSelector } from "../components/ui/BeltSelector";
import { Button } from "../components/ui/Button";
import { DateInput } from "../components/ui/DateInput";
import { DegreeSelector } from "../components/ui/DegreeSelector";
import { RoleCard } from "../components/RoleCard";
import { Select } from "../components/ui/Select";
import { TextField } from "../components/ui/TextField";
import type { UserRole } from "../src/core/ports/blackbelt-ports";
import type { BeltName } from "../src/core/belts/belts";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";
import { supabase } from "../src/infra/supabase/client";

const TOTAL_STEPS = 5;

const SEX_OPTIONS = [
  { label: "Masculino", value: "M" },
  { label: "Feminino", value: "F" },
  { label: "Outro", value: "O" },
  { label: "Prefiro não informar", value: "N" },
];

type OnboardingData = {
  role: UserRole | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: string;
  avatarUri: string;
  avatarUrl: string;
  belt: BeltName;
  degree: number;
  federationNumber: string;
};

const initialData: OnboardingData = {
  role: null,
  firstName: "",
  lastName: "",
  birthDate: "",
  sex: "",
  avatarUri: "",
  avatarUrl: "",
  belt: "Branca",
  degree: 0,
  federationNumber: "",
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
    // If profile is complete, go to app
    if (profile?.role && profile?.firstName && profile?.currentBelt) {
      router.replace("/");
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
        sex: (data.sex as "M" | "F" | "O" | "N") || null,
        avatarUrl: data.avatarUrl || null,
        currentBelt: data.belt,
        beltDegree: data.degree,
        federationNumber: data.federationNumber.trim() || null,
      });

      router.replace("/");
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
          data.sex.length > 0
        );
      case 3:
        return data.avatarUrl.length > 0 || data.avatarUri.length > 0;
      case 4:
        return data.belt !== null;
      case 5:
        return true; // Federation number is optional
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
          className={`h-1 flex-1 rounded-full ${
            i < step ? "bg-brand-500" : "bg-subtle-dark"
          }`}
        />
      ))}
    </View>
  );

  // Step 1: Role Selection
  const renderStep1 = () => (
    <View>
      <Text className="text-2xl font-semibold text-text-primary-dark">
        Como você vai usar o BlackBelt?
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Escolha seu perfil para personalizar sua experiência.
      </Text>

      <View className="mt-8 gap-4">
        <RoleCard
          title="Professor / Dono"
          description="Crie sua academia, gere convites e gerencie alunos."
          icon={GraduationCap}
          accent="brand"
          selected={data.role === "professor"}
          onPress={() => updateData({ role: "professor" })}
        />
        <RoleCard
          title="Aluno"
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
      <Text className="text-2xl font-semibold text-text-primary-dark">
        Seus dados pessoais
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Preencha suas informações básicas.
      </Text>

      <View className="mt-6 gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Nome"
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
              placeholder="Seu sobrenome"
              autoCapitalize="words"
            />
          </View>
        </View>

        <DateInput
          label="Data de nascimento"
          value={data.birthDate}
          onChangeDate={(v) => updateData({ birthDate: v })}
        />

        <Select
          label="Sexo"
          value={data.sex}
          options={SEX_OPTIONS}
          onValueChange={(v) => updateData({ sex: v })}
        />
      </View>
    </View>
  );

  // Step 3: Avatar
  const renderStep3 = () => (
    <View className="items-center">
      <Text className="text-2xl font-semibold text-text-primary-dark">
        Sua foto de perfil
      </Text>
      <Text className="mt-2 text-center text-text-secondary-dark">
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
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="text-sm text-brand-400">Enviando foto...</Text>
        </View>
      )}

      {data.avatarUrl && !isUploading && (
        <Text className="mt-4 text-sm text-success-dark">✓ Foto salva!</Text>
      )}

      <Text className="mt-6 text-center text-xs text-text-muted-dark">
        Toque no avatar para escolher uma foto da galeria
      </Text>
    </View>
  );

  // Step 4: Belt and Degree
  const renderStep4 = () => (
    <View>
      <Text className="text-2xl font-semibold text-text-primary-dark">
        Sua faixa atual
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Selecione sua faixa e quantidade de graus.
      </Text>

      <View className="mt-8">
        <BeltSelector
          label="Faixa"
          value={data.belt}
          onSelect={(v) => updateData({ belt: v, degree: 0 })}
        />
      </View>

      <View className="mt-6">
        <DegreeSelector
          label="Graus"
          value={data.degree}
          belt={data.belt}
          onSelect={(v) => updateData({ degree: v })}
        />
      </View>
    </View>
  );

  // Step 5: Federation (optional)
  const renderStep5 = () => (
    <View>
      <Text className="text-2xl font-semibold text-text-primary-dark">
        Número da federação
      </Text>
      <Text className="mt-2 text-text-secondary-dark">
        Opcional. Informe seu registro na CBJJ, IBJJF ou outra federação.
      </Text>

      <View className="mt-6">
        <TextField
          label="Número de registro"
          value={data.federationNumber}
          onChangeText={(v) => updateData({ federationNumber: v })}
          placeholder="Ex: CBJJ12345"
          autoCapitalize="characters"
          helperText="Você pode adicionar isso depois nas configurações"
        />
      </View>

      <View className="mt-8 rounded-xl bg-surface-dark-elevated p-4">
        <Text className="text-sm font-medium text-text-primary-dark">
          📋 Resumo do perfil
        </Text>
        <View className="mt-3 gap-1">
          <Text className="text-sm text-text-secondary-dark">
            Nome: {data.firstName} {data.lastName}
          </Text>
          <Text className="text-sm text-text-secondary-dark">
            Faixa: {data.belt} {data.degree > 0 ? `(${data.degree} graus)` : ""}
          </Text>
          <Text className="text-sm text-text-secondary-dark">
            Tipo: {data.role === "professor" ? "Professor/Dono" : "Aluno"}
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
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-app-dark">
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-page py-6">
            <View className="mx-auto w-full max-w-[500px]">
              {/* Header */}
              <Text className="text-xs uppercase tracking-widest text-brand-400">
                BlackBelt • Passo {step} de {TOTAL_STEPS}
              </Text>

              {/* Progress */}
              <View className="mt-4">{renderProgress()}</View>

              {/* Content */}
              <View className="mt-2">{renderCurrentStep()}</View>

              {/* Error */}
              {(error || saveError) && (
                <View className="mt-4 rounded-lg bg-error-dark/20 p-3">
                  <Text className="text-sm text-error-dark">
                    {error || saveError}
                  </Text>
                </View>
              )}

              {/* Navigation */}
              <View className="mt-8 flex-row gap-3">
                {step > 1 && (
                  <Button
                    variant="secondary"
                    onPress={handleBack}
                    disabled={isSaving}
                    className="flex-row items-center gap-1"
                  >
                    <ChevronLeft size={18} color="#F8FAFC" />
                    <Text className="text-text-primary-dark">Voltar</Text>
                  </Button>
                )}

                <Button
                  variant="primary"
                  onPress={handleNext}
                  disabled={!canProceed() || isSaving || isUploading}
                  className="flex-1 flex-row items-center justify-center gap-1"
                >
                  <Text className="font-medium text-white">
                    {isSaving
                      ? "Salvando..."
                      : step === TOTAL_STEPS
                      ? "Finalizar"
                      : "Continuar"}
                  </Text>
                  {step < TOTAL_STEPS && <ChevronRight size={18} color="#fff" />}
                </Button>
              </View>

              {step === 5 && (
                <Text className="mt-4 text-center text-xs text-text-muted-dark">
                  Ao finalizar, você concorda com os termos de uso.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
