import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

import { supabase } from "../src/infra/supabase/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const parseFragment = (url: string) => {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return new URLSearchParams();
  return new URLSearchParams(url.slice(hashIndex + 1));
};

const parseQuery = (url: string) => {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return new URLSearchParams();
  const hashIndex = url.indexOf("#");
  const endIndex = hashIndex === -1 ? undefined : hashIndex;
  return new URLSearchParams(url.slice(queryIndex + 1, endIndex));
};

export default function AuthCallback() {
  const router = useRouter();
  const urlFromHook = Linking.useURL();
  const [error, setError] = useState<string | null>(null);

  const status = useMemo(() => (error ? "error" : "loading"), [error]);

  useEffect(() => {
    let isActive = true;

    const finish = async () => {
      setError(null);

      try {
        const url = urlFromHook ?? (await Linking.getInitialURL());
        if (!url) {
          throw new Error("Nenhum link de autenticacao encontrado. Tente fazer login novamente.");
        }

        const query = parseQuery(url);
        const fragment = parseFragment(url);

        const callbackError = query.get("error") ?? fragment.get("error");
        const callbackErrorDescription =
          query.get("error_description") ?? fragment.get("error_description");
        if (callbackError) {
          throw new Error(callbackErrorDescription ?? callbackError);
        }

        const accessToken = fragment.get("access_token");
        const refreshToken = fragment.get("refresh_token");
        const code = query.get("code");

        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError) throw setSessionError;
        } else if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          throw new Error("Nao foi possivel finalizar o login. Tente fazer login novamente.");
        }

        if (Platform.OS === "web") {
          try {
            // Remove tokens from the URL (hash) after we consume them.
            const nextUrl = `${window.location.pathname}${window.location.search}`;
            window.history.replaceState({}, document.title, nextUrl);
          } catch {
            // Ignore
          }
        }

        if (!isActive) return;
        router.replace("/onboarding");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Nao foi possivel finalizar o login.");
      }
    };

    void finish();

    return () => {
      isActive = false;
    };
  }, [router, urlFromHook]);

  if (status === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator />
          <Text className="mt-3 text-sm text-muted-light dark:text-muted-dark">
            Finalizando autenticacao...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[420px]">
          <Card className="gap-3" variant="outline">
            <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
              Nao foi possivel autenticar
            </Text>
            <Text className="text-sm text-muted-light dark:text-muted-dark">
              {error ?? "Tente novamente."}
            </Text>
          </Card>
          <View className="mt-4">
            <Button label="Voltar para login" onPress={() => router.replace("/auth")} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

