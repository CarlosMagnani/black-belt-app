import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";

export default function OwnerSettings() {
  const router = useRouter();
  const { academy, isLoading, error } = useOwnerAcademy();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await blackBeltAdapters.auth.signOut();
      // AuthGate handles redirect
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Não foi possível sair.");
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[900px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Configuracoes
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Academia
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Informacoes basicas da academia.
          </Text>

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          {isLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando academia...
              </Text>
            </Card>
          ) : academy ? (
            <Card className="mt-6 gap-2">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Dados atuais
              </Text>
              <Text className="font-display text-xl text-strong-light dark:text-strong-dark">
                {academy.name}
              </Text>
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                {academy.city ?? "Cidade nao informada"}
              </Text>
              <Text className="mt-2 text-xs text-muted-light dark:text-muted-dark">
                Edicao completa sera adicionada nesta fase.
              </Text>
            </Card>
          ) : null}

          {/* Sign Out */}
          {signOutError && (
            <View className="mt-4 rounded-lg bg-red-500/10 p-3">
              <Text className="text-sm text-red-400">{signOutError}</Text>
            </View>
          )}
          <View className="mt-6">
            <Button
              label="Sair da conta"
              variant="ghost"
              onPress={handleSignOut}
              textClassName="text-red-400"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
