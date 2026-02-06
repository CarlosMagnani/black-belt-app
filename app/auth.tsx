import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";

import type { UserRole } from "../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";

type Mode = "signin" | "signup";

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (mode === "signup" && !role) return false;
    return !isLoading;
  }, [email, password, role, mode, isLoading]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        await blackBeltAdapters.auth.signIn(email.trim(), password);
      } else {
        await blackBeltAdapters.auth.signUp(email.trim(), password, role);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel autenticar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-50 opacity-80 dark:bg-brand-600/20" />
      <View className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-surface-light opacity-90 dark:bg-surface-dark dark:opacity-60" />

      <ScrollView className="flex-1">
        <View className="px-5 pb-10">
          <View className="mx-auto mt-10 w-full max-w-[520px]">
          <Text className="text-xs uppercase tracking-[4px] text-brand-600 dark:text-brand-50">
            BlackBelt
          </Text>
          <Text className="mt-3 font-display text-3xl text-strong-light dark:text-strong-dark">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </Text>
          <Text className="mt-2 text-base text-muted-light dark:text-muted-dark">
            {mode === "signin"
              ? "Acesse sua academia em segundos."
              : "Crie sua conta para comecar o onboarding."}
          </Text>

          <View className="mt-8 rounded-card border border-subtle-light bg-surface-light p-card shadow-card dark:border-subtle-dark dark:bg-surface-dark">
            <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              className="mt-2 rounded-input border border-subtle-light bg-app-light px-4 py-4 text-base text-strong-light dark:border-subtle-dark dark:bg-app-dark dark:text-strong-dark"
            />

            <Text className="mt-5 text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
              Senha
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              className="mt-2 rounded-input border border-subtle-light bg-app-light px-4 py-4 text-base text-strong-light dark:border-subtle-dark dark:bg-app-dark dark:text-strong-dark"
            />

            {mode === "signup" && (
              <View className="mt-6">
                <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
                  Tipo de perfil
                </Text>
                <View className="mt-3 flex-row gap-3">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setRole("professor")}
                    className={[
                      "flex-1 rounded-2xl border px-4 py-3",
                      role === "professor"
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-600/20"
                        : "border-subtle-light dark:border-subtle-dark",
                    ].join(" ")}
                  >
                    <Text className="text-center text-sm text-strong-light dark:text-strong-dark">
                      Professor
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setRole("student")}
                    className={[
                      "flex-1 rounded-2xl border px-4 py-3",
                      role === "student"
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-600/20"
                        : "border-subtle-light dark:border-subtle-dark",
                    ].join(" ")}
                  >
                    <Text className="text-center text-sm text-strong-light dark:text-strong-dark">
                      Aluno
                    </Text>
                  </Pressable>
                  
                </View>
              </View>
            )}

            {error ? <Text className="mt-4 text-sm text-red-500">{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={handleSubmit}
              className={[
                "mt-6 rounded-2xl px-5 py-4",
                canSubmit ? "bg-brand-600" : "bg-subtle-light dark:bg-subtle-dark",
              ].join(" ")}
              style={({ pressed }) => (pressed && canSubmit ? { opacity: 0.9 } : undefined)}
            >
              <Text
                className={
                  canSubmit
                    ? "text-center text-white"
                    : "text-center text-muted-light dark:text-muted-dark"
                }
              >
                {mode === "signin" ? "Entrar" : "Criar conta"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="mt-6 self-center"
          >
            <Text className="text-sm text-muted-light dark:text-muted-dark">
              {mode === "signin" ? "Ainda nao tem conta? Criar agora" : "Ja tem conta? Entrar"}
            </Text>
          </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
