import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Card } from "../../components/ui/Card";
import { useTheme } from "../../src/ui/theme/ThemeProvider";

type ThemeOption = {
  label: string;
  description: string;
  value: "system" | "light" | "dark";
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    label: "Sistema",
    description: "Segue o tema do dispositivo.",
    value: "system",
  },
  {
    label: "Claro",
    description: "Interface clara para treinos diurnos.",
    value: "light",
  },
  {
    label: "Escuro",
    description: "Menos brilho para ambientes noturnos.",
    value: "dark",
  },
];

export default function Settings() {
  const { preference, theme, setPreference } = useTheme();

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[800px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Ajustes
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Tema do app
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Escolha como prefere visualizar o BlackBelt.
          </Text>

          <Card className="mt-6">
            <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
              Tema atual
            </Text>
            <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
              {theme === "dark" ? "Modo escuro" : "Modo claro"}
            </Text>
            <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
              {preference === "system"
                ? "Ajustado automaticamente pelo sistema."
                : "Configurado manualmente por voce."}
            </Text>
          </Card>

          <View className="mt-6 gap-3">
            {THEME_OPTIONS.map((option) => {
              const isActive = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => void setPreference(option.value)}
                  className={[
                    "rounded-2xl border px-4 py-4",
                    isActive
                      ? "border-brand-600 bg-brand-50 dark:bg-brand-600/20"
                      : "border-subtle-light bg-surface-light dark:border-subtle-dark dark:bg-surface-dark",
                  ].join(" ")}
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
                >
                  <Text className="font-display text-base text-strong-light dark:text-strong-dark">
                    {option.label}
                  </Text>
                  <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
