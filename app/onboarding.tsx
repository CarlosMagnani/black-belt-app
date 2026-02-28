import { useLocalSearchParams, useRouter } from "expo-router";
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
import { GraduationCap, Users, ChevronLeft, ChevronRight, Mail } from "lucide-react-native";

import { Avatar } from "../components/ui/Avatar";
import { BeltSelector } from "../components/ui/BeltSelector";
import { DateInput } from "../components/ui/DateInput";
import { DegreeSelector } from "../components/ui/DegreeSelector";
import { RoleCard } from "../components/RoleCard";
import { TextField } from "../components/ui/TextField";
import type { UserRole, Sex } from "../src/core/ports/blackbelt-ports";
import type { BeltName } from "../src/core/belts/belts";
import { getErrorMessage } from "../src/core/errors/get-error-message";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";
import { supabase } from "../src/infra/supabase/client";

const TOTAL_STEPS = 4;

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: "Masculino", value: "M" },
  { label: "Feminino", value: "F" },
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
  const params = useLocalSearchParams<{ pendingEmail?: string | string[] }>();
  const pendingEmail = Array.isArray(params.pendingEmail) ? params.pendingEmail[0] : params.pendingEmail;
  const { isLoading, session, profile, role, refresh } = useAuthProfile();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmailMessage, setPendingEmailMessage] = useState<string | null>(null);
  const roleLocked = !!role;

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      if (pendingEmail) return;
      router.replace("/auth");
      return;
    }
    // If profile is complete, go to appropriate route
    const hasProfileName = !!profile?.firstName?.trim();
    if (role && hasProfileName && profile?.belt) {
      if (role === "student") {
        router.replace("/join-academy");
      } else if (role === "owner") {
        router.replace("/create-academy");
      } else {
        router.replace("/professor-checkins");
      }
    }
  }, [isLoading, session, profile, role, router, pendingEmail]);

  useEffect(() => {
    if (!role) return;
    setData((prev) => (prev.role ? prev : { ...prev, role }));
  }, [role]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const guessImageExt = (localUri: string, mimeType?: string | null): string => {
    const guessFromMime = (mime?: string | null): string | null => {
      const value = (mime ?? "").toLowerCase();
      if (!value.startsWith("image/")) return null;
      const subtype = value.slice("image/".length);
      if (subtype === "jpeg" || subtype === "jpg") return "jpg";
      if (subtype === "png") return "png";
      if (subtype === "webp") return "webp";
      if (subtype === "gif") return "gif";
      if (subtype === "heic") return "heic";
      if (subtype === "heif") return "heif";
      return null;
    };

    const guessFromUri = (uri: string): string | null => {
      const match = uri.toLowerCase().match(/\.([a-z0-9]{1,10})(?:$|[?#])/);
      if (!match?.[1]) return null;
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      if (!/^[a-z0-9]{1,10}$/.test(ext)) return null;
      return ext;
    };

    return guessFromMime(mimeType) ?? guessFromUri(localUri) ?? "jpg";
  };

  const handleAvatarSelected = async (localUri: string) => {
    if (!session?.user.id) return;
    
    setIsUploading(true);
    setSaveError(null);
    updateData({ avatarUri: localUri });

    try {
      const response = await fetch(localUri);
      const blob = await response.blob();

      const ext = guessImageExt(localUri, (blob as unknown as { type?: string }).type ?? null);
      const publicUrl = await blackBeltAdapters.storage.uploadAvatar(session.user.id, blob, ext);
      updateData({ avatarUrl: publicUrl });
    } catch (err) {
      console.error("Upload error:", err);
      setSaveError(getErrorMessage(err, "Nao foi possivel fazer upload da foto. Tente novamente."));
      updateData({ avatarUri: "" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = async () => {
    if (!session?.user.id) return;
    const selectedRole = data.role ?? role;
    if (!selectedRole) {
      setSaveError("Selecione como vai usar o BlackBelt para continuar.");
      setStep(1);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);

    try {
      // Persist onboarding role for users that still have no academy/membership.
      await supabase.auth.updateUser({
        data: {
          onboarding_role: selectedRole,
        },
      });

      await blackBeltAdapters.profiles.upsertProfile({
        id: session.user.id,
        firstName: data.firstName.trim(),
        birthDate: data.birthDate || null,
        sex: data.sex,
        photoUrl: data.avatarUrl || null,
        belt: data.belt,
        beltDegree: data.degree,
      });

      // Check if email is confirmed
      const { data: userData } = await supabase.auth.getUser();
      const emailConfirmed = userData?.user?.email_confirmed_at != null;

      if (!emailConfirmed) {
        // Show email confirmation screen
        setShowEmailConfirmation(true);
      } else {
        // Redirect based on role
        if (selectedRole === "student") {
          router.replace("/join-academy");
        } else if (selectedRole === "owner") {
          router.replace("/create-academy");
        } else {
          router.replace("/professor-checkins");
        }
      }
    } catch (err) {
      setSaveError(getErrorMessage(err, "Nao foi possivel salvar seu perfil."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckEmailConfirmed = async () => {
    try {
      await refresh();
      const selectedRole = data.role ?? role;
      const { data: userData } = await supabase.auth.getUser();
      const emailConfirmed = userData?.user?.email_confirmed_at != null;
      
      if (emailConfirmed && selectedRole) {
        if (selectedRole === "student") {
          router.replace("/join-academy");
        } else if (selectedRole === "owner") {
          router.replace("/create-academy");
        } else {
          router.replace("/professor-checkins");
        }
      }
    } catch (err) {
      console.log(err);
      
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

  // Step 1: Role Selection (First screen as in Lovable mockup)
  const renderStep1 = () => (
    <View className="flex-1 justify-center">
      <View className="items-center mb-10">
        <Text className="text-2xl font-bold text-text-primary-dark text-center">
          Como você vai usar o{"\n"}BlackBelt?
        </Text>
        <Text className="mt-3 text-text-secondary-dark text-center">
          Selecione seu perfil para continuar
        </Text>
      </View>

      <View className="gap-4">
        <RoleCard
          title="Sou Aluno"
          description="Quero treinar e acompanhar minha evolução no Jiu-Jitsu"
          icon={Users}
          selected={data.role === "student"}
          onPress={() => {
            if (roleLocked) return;
            updateData({ role: "student" });
          }}
        />
        <RoleCard
          title="Sou Dono"
          description="Quero gerenciar minha academia e meus alunos"
          icon={GraduationCap}
          accent="brand"
          selected={data.role === "owner"}
          onPress={() => {
            if (roleLocked) return;
            updateData({ role: "owner" });
          }}
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
        Conte-nos um pouco sobre você
      </Text>

      <View className="mt-6 gap-5">
        <TextField
          label="Primeiro nome"
          value={data.firstName}
          onChangeText={(v) => updateData({ firstName: v })}
          placeholder="Seu nome"
          autoCapitalize="words"
        />

        <TextField
          label="Sobrenome"
          value={data.lastName}
          onChangeText={(v) => updateData({ lastName: v })}
          placeholder="Seu sobrenome"
          autoCapitalize="words"
        />

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
                    "text-center font-medium text-sm",
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
        Selecione sua faixa atual e grau
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
          label="Grau (número de listras)"
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
        Adicione uma foto para os colegas te reconhecerem
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
        className="mt-6 py-3 px-6 rounded-xl border border-subtle-dark bg-surface-dark flex-row items-center gap-2"
      >
        <Text className="text-brand-400 font-medium">📷 Escolher foto</Text>
      </Pressable>

      <Text className="mt-4 text-center text-xs text-text-muted-dark">
        Opcional — você pode adicionar depois
      </Text>
    </View>
  );

  // Pending Email Confirmation (no session yet)
  const renderPendingEmailConfirmation = () => (
    <SafeAreaView className="flex-1 bg-app-dark">
      <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
      <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
      
      <View className="flex-1 justify-center px-6">
        <View className="mx-auto w-full max-w-[400px] items-center">
          {/* Icon */}
          <View className="h-20 w-20 rounded-full bg-brand-600/20 items-center justify-center mb-6">
            <Mail size={40} color="#8B5CF6" />
          </View>

          <Text className="text-xs uppercase tracking-[6px] text-brand-400 mb-3">
            Ultimo passo
          </Text>
          <Text className="font-display text-3xl font-bold text-text-primary-dark text-center">
            Verifique seu email
          </Text>
          <Text className="mt-4 text-base text-text-secondary-dark text-center">
            Enviamos um link de confirmacao para{"\n"}
            <Text className="font-semibold text-text-primary-dark">
              {pendingEmail}
            </Text>
          </Text>
          <Text className="mt-2 text-sm text-text-muted-dark text-center">
            Clique no link do email para ativar sua conta.
          </Text>

          {/* Check button */}
          <Pressable
            onPress={async () => {
              setPendingEmailMessage(null);
              try {
                await refresh();
                const { data: sessionData } = await supabase.auth.getSession();
                if (!sessionData.session) {
                  setPendingEmailMessage(
                    "Ainda nao ha sessao. Abra o link de confirmacao no mesmo dispositivo/app ou faca login."
                  );
                }
              } catch {
                setPendingEmailMessage("Nao foi possivel verificar a sessao. Faca login.");
              }
            }}
            className="mt-8 w-full overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#7C3AED", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-8 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                Ja confirmei, verificar novamente
              </Text>
            </LinearGradient>
          </Pressable>

          {pendingEmailMessage ? (
            <View className="mt-4 w-full rounded-xl bg-error-dark/20 p-4">
              <Text className="text-center text-sm text-error-dark">{pendingEmailMessage}</Text>
            </View>
          ) : null}

          {/* Resend link */}
          <Pressable
            onPress={async () => {
              if (pendingEmail) {
                await supabase.auth.resend({
                  type: "signup",
                  email: pendingEmail,
                });
              }
            }}
            className="mt-4 py-2"
          >
            <Text className="text-sm text-text-secondary-dark">
              Nao recebeu? <Text className="text-brand-400">Reenviar email</Text>
            </Text>
          </Pressable>

          {/* Back */}
          <Pressable
            onPress={() => router.replace("/auth")}
            className="mt-4 py-2"
          >
            <Text className="text-sm text-text-secondary-dark">
              Voltar para login
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );

  // Email Confirmation Screen
  const renderEmailConfirmation = () => (
    <SafeAreaView className="flex-1 bg-app-dark">
      <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
      <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
      
      <View className="flex-1 justify-center px-6">
        <View className="mx-auto w-full max-w-[400px] items-center">
          {/* Icon */}
          <View className="h-20 w-20 rounded-full bg-brand-600/20 items-center justify-center mb-6">
            <Mail size={40} color="#8B5CF6" />
          </View>

          <Text className="text-xs uppercase tracking-[6px] text-brand-400 mb-3">
            Último passo
          </Text>
          <Text className="font-display text-3xl font-bold text-text-primary-dark text-center">
            Verifique seu email
          </Text>
          <Text className="mt-4 text-base text-text-secondary-dark text-center">
            Enviamos um link de confirmação para{"\n"}
            <Text className="font-semibold text-text-primary-dark">
              {session?.user.email}
            </Text>
          </Text>
          <Text className="mt-2 text-sm text-text-muted-dark text-center">
            Clique no link do email para ativar sua conta.
          </Text>

          {/* Check button */}
          <Pressable
            onPress={handleCheckEmailConfirmed}
            className="mt-8 w-full overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={["#7C3AED", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-8 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                Já confirmei, continuar
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Resend link */}
          <Pressable
            onPress={async () => {
              if (session?.user.email) {
                await supabase.auth.resend({
                  type: "signup",
                  email: session.user.email,
                });
              }
            }}
            className="mt-4 py-2"
          >
            <Text className="text-sm text-text-secondary-dark">
              Não recebeu? <Text className="text-brand-400">Reenviar email</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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

  if (!session && pendingEmail) {
    return renderPendingEmailConfirmation();
  }

  if (showEmailConfirmation) {
    return renderEmailConfirmation();
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
        <ScrollView 
          className="flex-1" 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 py-6">
            <View className="mx-auto w-full max-w-[500px] flex-1">
              {/* Header with progress (not on step 1) */}
              {step > 1 && (
                <>
                  <Text className="text-xs uppercase tracking-[4px] text-brand-400">
                    Criar Perfil
                  </Text>
                  <View className="mt-4">{renderProgress()}</View>
                </>
              )}

              {/* Content */}
              <View className={step === 1 ? "flex-1" : "mt-4"}>
                {renderCurrentStep()}
              </View>

              {/* Error */}
              {saveError && (
                <View className="mt-4 rounded-xl bg-error-dark/20 p-4">
                  <Text className="text-sm text-error-dark">{saveError}</Text>
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
                        ? "Concluir"
                        : "Próximo"}
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
