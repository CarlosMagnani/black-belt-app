import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ArrowRight, KeyRound } from "lucide-react-native";

import { useTheme } from "../src/ui/theme/ThemeProvider";

type JoinAcademyCardProps = {
  onSubmit: (inviteCode: string) => void | Promise<void>;
  isLoading?: boolean;
  helperText?: string;
  errorMessage?: string | null;
};

const normalizeInviteCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9-]/g, "");

export function JoinAcademyCard({
  onSubmit,
  isLoading = false,
  helperText = "Use o codigo fornecido pelo professor.",
  errorMessage,
}: JoinAcademyCardProps) {
  const [inviteCode, setInviteCode] = useState("");
  const { theme } = useTheme();
  const iconColor = theme === "dark" ? "#E0E7FF" : "#1E40AF";

  const formattedCode = useMemo(() => normalizeInviteCode(inviteCode), [inviteCode]);
  const canSubmit = formattedCode.length >= 4 && !isLoading;

  return (
    <View className="rounded-card border border-subtle-light bg-surface-light p-card shadow-card dark:border-subtle-dark dark:bg-surface-dark">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-600/20">
          <KeyRound size={20} color={iconColor} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
            Entrar em uma academia
          </Text>
          <Text className="text-sm text-muted-light dark:text-muted-dark">{helperText}</Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
          Codigo de acesso
        </Text>
        <TextInput
          value={formattedCode}
          onChangeText={setInviteCode}
          placeholder="Ex: GBC-2024"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={16}
          className="mt-2 rounded-input border border-subtle-light bg-app-light px-4 py-4 text-base text-strong-light dark:border-subtle-dark dark:bg-app-dark dark:text-strong-dark"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => onSubmit(formattedCode)}
        className={[
          "mt-5 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4",
          canSubmit ? "bg-brand-600" : "bg-subtle-light dark:bg-subtle-dark",
        ].join(" ")}
        style={({ pressed }) => (pressed && canSubmit ? { opacity: 0.9 } : undefined)}
      >
        <Text className={canSubmit ? "text-white" : "text-muted-light dark:text-muted-dark"}>
          Entrar
        </Text>
        <ArrowRight size={18} color={canSubmit ? "#FFFFFF" : "#94A3B8"} strokeWidth={2.2} />
      </Pressable>

      {errorMessage ? <Text className="mt-4 text-sm text-red-500">{errorMessage}</Text> : null}
    </View>
  );
}
