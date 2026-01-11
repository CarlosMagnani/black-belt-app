import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

import type { Academy, Belt, MemberProfile } from "../src/core/ports/dojoflow-ports";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { dojoFlowAdapters } from "../src/infra/supabase/adapters";

const BELTS: Belt[] = ["Branca", "Azul", "Roxa", "Marrom", "Preta"];

const nextBelt = (belt: Belt | null): Belt => {
  if (!belt) return BELTS[0];
  const index = BELTS.indexOf(belt);
  return BELTS[Math.min(index + 1, BELTS.length - 1)];
};

const generateInviteCode = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const part = Array.from({ length: 3 })
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join("");
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${part}-${digits}`;
};

export default function CreateAcademy() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => name.trim().length > 2 && !isLoading, [name, isLoading]);

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
    if (profile.role !== "professor") {
      router.replace("/");
    }
  }, [isBooting, session, profile, router]);

  useEffect(() => {
    if (!profile?.id) return;
    if (profile.role !== "professor") return;

    const loadAcademy = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const existing = await dojoFlowAdapters.academies.getByOwnerId(profile.id);
        if (!existing) {
          setAcademy(null);
          setMembers([]);
          return;
        }
        setAcademy(existing);
        const memberList = await dojoFlowAdapters.memberships.listMembersWithProfiles(existing.id);
        setMembers(memberList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAcademy();
  }, [profile?.id, profile?.role]);

  const generateUniqueCode = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateInviteCode();
      const existing = await dojoFlowAdapters.academies.getByInviteCode(code);
      if (!existing) return code;
    }
    throw new Error("Nao foi possivel gerar um codigo unico.");
  };

  const handleCreateAcademy = async () => {
    if (!profile?.id || profile.role !== "professor") return;
    setIsLoading(true);
    setError(null);
    try {
      const inviteCode = await generateUniqueCode();
      const created = await dojoFlowAdapters.academies.createAcademy({
        ownerId: profile.id,
        name: name.trim(),
        city: city.trim() || null,
        logoUrl: logoUrl.trim() || null,
        inviteCode,
      });
      setAcademy(created);
      setMembers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a academia.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async (member: MemberProfile) => {
    if (!member.userId) return;
    const newBelt = nextBelt(member.currentBelt);
    setIsUpdating(member.userId);
    try {
      await dojoFlowAdapters.profiles.setCurrentBelt(member.userId, newBelt);
      setMembers((prev) =>
        prev.map((item) => (item.userId === member.userId ? { ...item, currentBelt: newBelt } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar a faixa.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="flex-1 px-5">
        <View className="mx-auto w-full max-w-[520px]">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="mt-4 flex-row items-center gap-2 self-start"
          >
            <ArrowLeft size={18} color="#0F172A" strokeWidth={2.2} />
            <Text className="text-sm text-ink">Voltar</Text>
          </Pressable>

          <Text className="mt-6 font-display text-2xl text-ink">
            {academy ? "Sua academia" : "Criar academia"}
          </Text>
          <Text className="mt-2 text-base text-slate-600">
            {academy
              ? "Compartilhe o codigo com seus alunos e gerencie as faixas."
              : "Cadastre sua academia e gere o codigo de acesso."}
          </Text>

          {isBooting || isLoading ? (
            <View className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-slate-500">Carregando dados...</Text>
            </View>
          ) : null}

          {error ? <Text className="mt-4 text-sm text-red-500">{error}</Text> : null}

          {!academy ? (
            <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Text className="text-xs uppercase tracking-widest text-slate-500">Nome</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Dojo Central"
                placeholderTextColor="#94A3B8"
                className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
              />

              <Text className="mt-5 text-xs uppercase tracking-widest text-slate-500">Cidade</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Ex: Sao Paulo"
                placeholderTextColor="#94A3B8"
                className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
              />

              <Text className="mt-5 text-xs uppercase tracking-widest text-slate-500">
                Logo (URL)
              </Text>
              <TextInput
                value={logoUrl}
                onChangeText={setLogoUrl}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
              />

              <Pressable
                accessibilityRole="button"
                disabled={!canCreate}
                onPress={handleCreateAcademy}
                className={[
                  "mt-6 rounded-2xl px-5 py-4",
                  canCreate ? "bg-brand-600" : "bg-slate-200",
                ].join(" ")}
                style={({ pressed }) => (pressed && canCreate ? { opacity: 0.9 } : undefined)}
              >
                <Text className={canCreate ? "text-center text-white" : "text-center text-slate-500"}>
                  Gerar codigo
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-6">
              <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Text className="text-xs uppercase tracking-widest text-slate-500">
                  Codigo de acesso
                </Text>
                <Text className="mt-2 font-display text-3xl text-ink">{academy.inviteCode}</Text>
                <Text className="mt-3 text-sm text-slate-600">
                  {academy.name}
                  {academy.city ? ` - ${academy.city}` : ""}
                </Text>
                <Text className="mt-3 text-sm text-slate-600">
                  Compartilhe este codigo com os alunos para liberar o acesso.
                </Text>
              </View>

              <View className="mt-6">
                <Text className="font-display text-lg text-ink">Alunos vinculados</Text>
                <Text className="mt-1 text-sm text-slate-600">
                  Atualize rapidamente a faixa de cada aluno.
                </Text>
                <View className="mt-4 gap-3">
                  {members.length === 0 ? (
                    <View className="rounded-2xl border border-dashed border-slate-200 bg-white p-5">
                      <Text className="text-sm text-slate-500">
                        Nenhum aluno vinculado ainda.
                      </Text>
                    </View>
                  ) : (
                    members.map((member) => (
                      <View
                        key={member.userId}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <Text className="font-display text-base text-ink">
                          {member.fullName || member.email || "Aluno"}
                        </Text>
                        <Text className="mt-1 text-sm text-slate-600">
                          Faixa atual: {member.currentBelt ?? "Branca"}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => handlePromote(member)}
                          disabled={isUpdating === member.userId}
                          className={[
                            "mt-3 self-start rounded-xl px-4 py-2",
                            isUpdating === member.userId ? "bg-slate-200" : "bg-brand-50",
                          ].join(" ")}
                          style={({ pressed }) =>
                            pressed && isUpdating !== member.userId ? { opacity: 0.85 } : undefined
                          }
                        >
                          <Text className="text-sm text-brand-700">
                            {isUpdating === member.userId ? "Atualizando..." : "Promover faixa"}
                          </Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
