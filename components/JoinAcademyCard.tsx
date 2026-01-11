import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ArrowRight, KeyRound } from "lucide-react-native";

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

  const formattedCode = useMemo(() => normalizeInviteCode(inviteCode), [inviteCode]);
  const canSubmit = formattedCode.length >= 4 && !isLoading;

  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <KeyRound size={20} color="#1E40AF" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="font-display text-lg text-ink">Entrar em uma academia</Text>
          <Text className="text-sm text-slate-600">{helperText}</Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="text-xs uppercase tracking-widest text-slate-500">Codigo de acesso</Text>
        <TextInput
          value={formattedCode}
          onChangeText={setInviteCode}
          placeholder="Ex: GBC-2024"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={16}
          className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => onSubmit(formattedCode)}
        className={[
          "mt-5 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4",
          canSubmit ? "bg-brand-600" : "bg-slate-200",
        ].join(" ")}
        style={({ pressed }) => (pressed && canSubmit ? { opacity: 0.9 } : undefined)}
      >
        <Text className={canSubmit ? "text-white" : "text-slate-500"}>Entrar</Text>
        <ArrowRight size={18} color={canSubmit ? "#FFFFFF" : "#94A3B8"} strokeWidth={2.2} />
      </Pressable>

      {errorMessage ? <Text className="mt-4 text-sm text-red-500">{errorMessage}</Text> : null}
    </View>
  );
}
