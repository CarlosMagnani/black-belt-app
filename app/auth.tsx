import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { TextField } from "../components/ui/TextField";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";

type Mode = "signin" | "signup";

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (mode === "signup" && password !== confirmPassword) return false;
    if (mode === "signup" && password.length < 6) return false;
    return !isLoading;
  }, [email, password, confirmPassword, mode, isLoading]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        await blackBeltAdapters.auth.signIn(email.trim(), password);
        router.replace("/");
      } else {
        // Sign up and go directly to onboarding
        // Email confirmation will be handled at the end of onboarding
        await blackBeltAdapters.auth.signUp(email.trim(), password);
        router.replace("/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível autenticar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-dark">
      {/* Gradient background effects */}
      <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
      <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-10">
            <View className="mx-auto w-full max-w-[400px]">
              {/* Header */}
              <View className="items-center mb-10">
                <Text className="text-xs uppercase tracking-[6px] text-brand-400 mb-3">
                  BlackBelt
                </Text>
                <Text className="font-display text-3xl font-bold text-text-primary-dark text-center">
                  {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
                </Text>
                <Text className="mt-2 text-base text-text-secondary-dark text-center">
                  {mode === "signin"
                    ? "Entre para acessar sua academia"
                    : "Comece sua jornada no Jiu-Jitsu"}
                </Text>
              </View>

              {/* Tab Selector */}
              <View className="flex-row mb-8 rounded-2xl bg-surface-dark p-1.5">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className={[
                    "flex-1 py-3.5 rounded-xl",
                    mode === "signin" ? "bg-brand-600" : "",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "text-center font-medium",
                      mode === "signin" ? "text-white" : "text-text-secondary-dark",
                    ].join(" ")}
                  >
                    Entrar
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={[
                    "flex-1 py-3.5 rounded-xl",
                    mode === "signup" ? "bg-brand-600" : "",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "text-center font-medium",
                      mode === "signup" ? "text-white" : "text-text-secondary-dark",
                    ].join(" ")}
                  >
                    Criar Conta
                  </Text>
                </Pressable>
              </View>

              {/* Form */}
              <View className="gap-5">
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                />

                <TextField
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  helperText={mode === "signup" ? "Mínimo 6 caracteres" : undefined}
                />

                {mode === "signup" && (
                  <TextField
                    label="Confirmar Senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    autoComplete="new-password"
                    errorMessage={
                      confirmPassword && password !== confirmPassword
                        ? "As senhas não coincidem"
                        : null
                    }
                  />
                )}
              </View>

              {/* Error */}
              {error && (
                <View className="mt-4 rounded-xl bg-error-dark/20 p-4">
                  <Text className="text-sm text-error-dark">{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                accessibilityRole="button"
                disabled={!canSubmit}
                onPress={handleSubmit}
                className="mt-8 overflow-hidden rounded-2xl"
                style={({ pressed }) => ({
                  opacity: pressed && canSubmit ? 0.9 : 1,
                })}
              >
                <LinearGradient
                  colors={canSubmit ? ["#7C3AED", "#6366F1"] : ["#374151", "#374151"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-4"
                >
                  <Text
                    className={[
                      "text-center text-base font-semibold",
                      canSubmit ? "text-white" : "text-text-muted-dark",
                    ].join(" ")}
                  >
                    {isLoading
                      ? "Aguarde..."
                      : mode === "signin"
                      ? "Entrar"
                      : "Criar Conta"}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Forgot password (only for signin) */}
              {mode === "signin" && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    Alert.alert(
                      "Recuperar senha",
                      "Entre em contato com o suporte para redefinir sua senha.",
                      [{ text: "OK" }]
                    );
                  }}
                  className="mt-4 self-center py-2"
                >
                  <Text className="text-sm text-brand-400">Esqueci minha senha</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
