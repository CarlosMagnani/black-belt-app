import React from "react";
import { ScrollView, Text, View } from "react-native";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";

export default function OwnerBilling() {
  const { isLoading, error } = useOwnerAcademy();

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[900px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Assinatura
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Plano da academia
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Gerencie seu plano e pagamentos.
          </Text>

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          {isLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando dados...
              </Text>
            </Card>
          ) : null}

          <Card className="mt-6 gap-3">
            <Text className="text-sm text-muted-light dark:text-muted-dark">
              Em breve voce podera acessar o checkout web para atualizar sua assinatura.
            </Text>
            <Button label="Abrir checkout" variant="secondary" onPress={() => null} />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
