import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Building2, CheckCircle, Search } from "lucide-react-native";

import type { Academy } from "../src/core/ports/blackbelt-ports";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";

/** Invite code length without hyphen (e.g., "ABC1234" = 7 chars) */
const INVITE_CODE_LENGTH = 7;

const normalizeCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, INVITE_CODE_LENGTH);

const formatCode = (code: string): string => {
  // Format as XXX-XXXX
  if (code.length <= 3) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
};

export default function JoinAcademy() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  
  const [inviteCode, setInviteCode] = useState("");
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search for academy when code has enough characters
  const searchAcademy = useCallback(async (code: string) => {
    if (code.length < INVITE_CODE_LENGTH) {
      setAcademy(null);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Format code with hyphen for search
      const formattedCode = formatCode(code);
      const found = await blackBeltAdapters.academies.getByInviteCode(formattedCode);
      
      if (found) {
        setAcademy(found);
        setSearchError(null);
      } else {
        setAcademy(null);
        setSearchError("Código não encontrado");
      }
    } catch (err) {
      setAcademy(null);
      setSearchError("Erro ao buscar academia");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = normalizeCode(inviteCode);
      if (normalized.length >= INVITE_CODE_LENGTH) {
        searchAcademy(normalized);
      } else {
        setAcademy(null);
        setSearchError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inviteCode, searchAcademy]);

  const handleJoin = async () => {
    if (!session || !academy) return;
    
    setIsJoining(true);
    setError(null);

    try {
      await blackBeltAdapters.memberships.addMember({
        academyId: academy.id,
        userId: session.user.id,
      });
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar na academia.");
    } finally {
      setIsJoining(false);
    }
  };

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
    if (profile.role !== "student") {
      router.replace("/");
    }
  }, [isBooting, session, profile, router]);

  // Check if already has membership
  useEffect(() => {
    if (!profile?.id || profile.role !== "student") return;

    const checkMembership = async () => {
      try {
        const memberships = await blackBeltAdapters.memberships.listByUser(profile.id);
        if (memberships.length > 0) {
          router.replace("/home");
        }
      } catch (err) {
        // Ignore - will show join screen
      }
    };

    void checkMembership();
  }, [profile?.id, profile?.role, router]);

  const displayCode = formatCode(normalizeCode(inviteCode));

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
              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                className="flex-row items-center gap-2 self-start py-2"
              >
                <ArrowLeft size={18} color="#94A3B8" strokeWidth={2.2} />
                <Text className="text-sm text-text-secondary-dark">Voltar</Text>
              </Pressable>

              {/* Header */}
              <View className="mt-8">
                <Text className="text-xs uppercase tracking-[4px] text-brand-400 mb-3">
                  Última etapa
                </Text>
                <Text className="font-display text-2xl font-bold text-text-primary-dark">
                  Entrar em uma academia
                </Text>
                <Text className="mt-2 text-base text-text-secondary-dark">
                  Digite o código de {INVITE_CODE_LENGTH} caracteres fornecido pelo seu professor.
                </Text>
              </View>

              {/* Code Input */}
              <View className="mt-8">
                <Text className="mb-3 text-xs uppercase tracking-widest text-text-muted-dark">
                  Código de acesso
                </Text>
                <View className="relative">
                  <TextInput
                    value={displayCode}
                    onChangeText={(v) => setInviteCode(v.replace(/-/g, ""))}
                    placeholder="ABC-1234"
                    placeholderTextColor="#64748B"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={INVITE_CODE_LENGTH + 1} // +1 for hyphen
                    className="rounded-xl border border-subtle-dark bg-surface-dark px-5 py-4 text-xl font-mono text-center text-text-primary-dark tracking-widest"
                    style={{ letterSpacing: 4 }}
                  />
                  {isSearching && (
                    <View className="absolute right-4 top-1/2 -translate-y-1/2">
                      <ActivityIndicator size="small" color="#8B5CF6" />
                    </View>
                  )}
                </View>
                <Text className="mt-2 text-xs text-text-muted-dark text-center">
                  Seu professor compartilha o código com a turma
                </Text>
              </View>

              {/* Search Error */}
              {searchError && !isSearching && normalizeCode(inviteCode).length >= INVITE_CODE_LENGTH && (
                <View className="mt-4 rounded-xl bg-error-dark/20 p-4 flex-row items-center gap-3">
                  <Search size={18} color="#F87171" />
                  <Text className="flex-1 text-sm text-error-dark">{searchError}</Text>
                </View>
              )}

              {/* Academy Preview Card */}
              {academy && (
                <View className="mt-6 rounded-2xl border border-brand-500/30 bg-surface-dark-elevated p-5">
                  <View className="flex-row items-center gap-4">
                    <View className="h-14 w-14 items-center justify-center rounded-xl bg-brand-600/20">
                      <Building2 size={28} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-display text-lg font-semibold text-text-primary-dark">
                        {academy.name}
                      </Text>
                      {academy.city && (
                        <Text className="mt-0.5 text-sm text-text-secondary-dark">
                          📍 {academy.city}
                        </Text>
                      )}
                    </View>
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-success-dark/20">
                      <CheckCircle size={18} color="#34D399" />
                    </View>
                  </View>
                </View>
              )}

              {/* Error */}
              {error && (
                <View className="mt-4 rounded-xl bg-error-dark/20 p-4">
                  <Text className="text-sm text-error-dark">{error}</Text>
                </View>
              )}

              {/* Join Button */}
              <Pressable
                accessibilityRole="button"
                disabled={!academy || isJoining}
                onPress={handleJoin}
                className="mt-8 overflow-hidden rounded-2xl"
                style={({ pressed }) => ({
                  opacity: pressed && academy ? 0.9 : 1,
                })}
              >
                <LinearGradient
                  colors={academy && !isJoining ? ["#7C3AED", "#6366F1"] : ["#374151", "#374151"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-4"
                >
                  <Text
                    className={[
                      "text-center text-base font-semibold",
                      academy ? "text-white" : "text-text-muted-dark",
                    ].join(" ")}
                  >
                    {isJoining ? "Entrando..." : "Confirmar Entrada"}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Loading indicator */}
              {isBooting && (
                <View className="mt-8 flex-row items-center justify-center gap-3">
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text className="text-sm text-text-muted-dark">
                    Verificando seu perfil...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
