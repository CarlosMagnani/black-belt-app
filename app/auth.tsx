import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";

import type { UserRole } from "../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../src/infra/supabase/adapters";

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
        await dojoFlowAdapters.auth.signIn(email.trim(), password);
      } else {
        await dojoFlowAdapters.auth.signUp(email.trim(), password, role);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel autenticar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-50 opacity-80" />
      <View className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-slate-100 opacity-90" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="flex-1 px-5">
        <View className="mx-auto mt-10 w-full max-w-[520px]">
          <Text className="text-xs uppercase tracking-[4px] text-brand-600">DojoFlow</Text>
          <Text className="mt-3 font-display text-3xl text-ink">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </Text>
          <Text className="mt-2 text-base text-slate-600">
            {mode === "signin"
              ? "Acesse sua academia em segundos."
              : "Crie sua conta para comecar o onboarding."}
          </Text>

          <View className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Text className="text-xs uppercase tracking-widest text-slate-500">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
            />

            <Text className="mt-5 text-xs uppercase tracking-widest text-slate-500">Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
            />

            {mode === "signup" && (
              <View className="mt-6">
                <Text className="text-xs uppercase tracking-widest text-slate-500">
                  Tipo de perfil
                </Text>
                <View className="mt-3 flex-row gap-3">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setRole("professor")}
                    className={[
                      "flex-1 rounded-2xl border px-4 py-3",
                      role === "professor" ? "border-brand-600 bg-brand-50" : "border-slate-200",
                    ].join(" ")}
                  >
                    <Text className="text-center text-sm text-ink">Professor</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setRole("student")}
                    className={[
                      "flex-1 rounded-2xl border px-4 py-3",
                      role === "student" ? "border-brand-600 bg-brand-50" : "border-slate-200",
                    ].join(" ")}
                  >
                    <Text className="text-center text-sm text-ink">Aluno</Text>
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
                canSubmit ? "bg-brand-600" : "bg-slate-200",
              ].join(" ")}
              style={({ pressed }) => (pressed && canSubmit ? { opacity: 0.9 } : undefined)}
            >
              <Text className={canSubmit ? "text-center text-white" : "text-center text-slate-500"}>
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
            <Text className="text-sm text-slate-600">
              {mode === "signin" ? "Ainda nao tem conta? Criar agora" : "Ja tem conta? Entrar"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
