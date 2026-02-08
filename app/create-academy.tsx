import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { ArrowLeft, Building2, Copy, Check } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";

import { TextField } from "../components/ui/TextField";
import type { Academy } from "../src/core/ports/blackbelt-ports";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";

const generateInviteCode = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const part = Array.from({ length: 3 })
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join("");
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${part}-${digits}`;
};

export default function CreateAcademy() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canCreate = useMemo(() => name.trim().length >= 3 && !isLoading, [name, isLoading]);

  // Auth/Profile guards
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
    if (profile.role !== "professor") {
      router.replace("/");
    }
  }, [isBooting, session, profile, router]);

  // Check for existing academy
  useEffect(() => {
    if (!profile?.id || profile.role !== "professor") return;

    const loadAcademy = async () => {
      setIsCheckingExisting(true);
      try {
        const existing = await blackBeltAdapters.academies.getByOwnerId(profile.id);
        if (existing) {
          setAcademy(existing);
        }
      } catch (err) {
        // Ignore - will show create form
      } finally {
        setIsCheckingExisting(false);
      }
    };

    void loadAcademy();
  }, [profile?.id, profile?.role]);

  const generateUniqueCode = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateInviteCode();
      const existing = await blackBeltAdapters.academies.getByInviteCode(code);
      if (!existing) return code;
    }
    throw new Error("Não foi possível gerar um código único.");
  };

  const handleCreateAcademy = async () => {
    if (!profile?.id || profile.role !== "professor") return;
    
    setIsLoading(true);
    setError(null);

    try {
      const inviteCode = await generateUniqueCode();
      const created = await blackBeltAdapters.academies.createAcademy({
        ownerId: profile.id,
        name: name.trim(),
        city: city.trim() || null,
        logoUrl: null,
        inviteCode,
      });
      setAcademy(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a academia.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!academy?.inviteCode) return;
    await Clipboard.setStringAsync(academy.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.replace("/(owner)/owner-home");
  };

  // Loading state
  if (isBooting || isCheckingExisting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-app-dark">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-sm text-text-muted-dark">Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-dark">
      {/* Background effects */}
      <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/15" />
      <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-6">
            <View className="mx-auto w-full max-w-[450px]">
              {/* Back button */}
              {!academy && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.back()}
                  className="flex-row items-center gap-2 self-start py-2"
                >
                  <ArrowLeft size={18} color="#94A3B8" strokeWidth={2.2} />
                  <Text className="text-sm text-text-secondary-dark">Voltar</Text>
                </Pressable>
              )}

              {/* Header */}
              <View className={academy ? "mt-8" : "mt-8"}>
                <Text className="text-xs uppercase tracking-[4px] text-brand-400 mb-3">
                  {academy ? "Academia criada!" : "Última etapa"}
                </Text>
                <Text className="font-display text-2xl font-bold text-text-primary-dark">
                  {academy ? "Sua academia está pronta" : "Criar sua academia"}
                </Text>
                <Text className="mt-2 text-base text-text-secondary-dark">
                  {academy
                    ? "Compartilhe o código abaixo com seus alunos para eles entrarem."
                    : "Configure sua academia e gere um código de acesso para seus alunos."}
                </Text>
              </View>

              {/* Create Form */}
              {!academy && (
                <View className="mt-8 gap-5">
                  <TextField
                    label="Nome da academia"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Gracie Barra Centro"
                    autoCapitalize="words"
                    helperText="Mínimo 3 caracteres"
                  />

                  <TextField
                    label="Cidade (opcional)"
                    value={city}
                    onChangeText={setCity}
                    placeholder="Ex: São Paulo"
                    autoCapitalize="words"
                  />

                  {error && (
                    <View className="rounded-xl bg-error-dark/20 p-4">
                      <Text className="text-sm text-error-dark">{error}</Text>
                    </View>
                  )}

                  <Pressable
                    accessibilityRole="button"
                    disabled={!canCreate}
                    onPress={handleCreateAcademy}
                    className="mt-4 overflow-hidden rounded-2xl"
                    style={({ pressed }) => ({
                      opacity: pressed && canCreate ? 0.9 : 1,
                    })}
                  >
                    <LinearGradient
                      colors={canCreate ? ["#7C3AED", "#6366F1"] : ["#374151", "#374151"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-6 py-4"
                    >
                      <Text
                        className={[
                          "text-center text-base font-semibold",
                          canCreate ? "text-white" : "text-text-muted-dark",
                        ].join(" ")}
                      >
                        {isLoading ? "Criando..." : "Criar Academia"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}

              {/* Success - Academy Created */}
              {academy && (
                <View className="mt-8">
                  {/* Academy Card */}
                  <View className="rounded-2xl border border-brand-500/30 bg-surface-dark-elevated p-6">
                    <View className="flex-row items-center gap-4 mb-6">
                      <View className="h-16 w-16 items-center justify-center rounded-xl bg-brand-600/20">
                        <Building2 size={32} color="#8B5CF6" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-display text-xl font-semibold text-text-primary-dark">
                          {academy.name}
                        </Text>
                        {academy.city && (
                          <Text className="mt-1 text-sm text-text-secondary-dark">
                            📍 {academy.city}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Invite Code */}
                    <View className="rounded-xl bg-app-dark p-5 border border-subtle-dark">
                      <Text className="text-xs uppercase tracking-widest text-text-muted-dark text-center mb-3">
                        Código de acesso
                      </Text>
                      <Text className="font-mono text-3xl font-bold text-brand-400 text-center tracking-widest">
                        {academy.inviteCode}
                      </Text>
                    </View>

                    {/* Copy Button */}
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleCopyCode}
                      className="mt-4 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-subtle-dark bg-surface-dark"
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    >
                      {copied ? (
                        <>
                          <Check size={18} color="#34D399" />
                          <Text className="text-success-dark font-medium">Copiado!</Text>
                        </>
                      ) : (
                        <>
                          <Copy size={18} color="#8B5CF6" />
                          <Text className="text-brand-400 font-medium">Copiar código</Text>
                        </>
                      )}
                    </Pressable>
                  </View>

                  {/* Info */}
                  <View className="mt-6 rounded-xl bg-surface-dark p-4 border border-subtle-dark">
                    <Text className="text-sm text-text-secondary-dark">
                      💡 <Text className="font-medium">Dica:</Text> Compartilhe este código com seus alunos no WhatsApp, na academia ou nas redes sociais.
                    </Text>
                  </View>

                  {/* Continue Button */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleContinue}
                    className="mt-8 overflow-hidden rounded-2xl"
                    style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                  >
                    <LinearGradient
                      colors={["#7C3AED", "#6366F1"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-6 py-4"
                    >
                      <Text className="text-center text-base font-semibold text-white">
                        Ir para o Dashboard
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
