import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import type { Academy } from "../../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";
import { BeltBadge } from "../../src/ui/belts/BeltBadge";

const splitFullName = (fullName?: string | null) => {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const [first, ...rest] = parts;
  return { firstName: first, lastName: rest.join(" ") };
};

export default function Profile() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile, refresh } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [federationNumber, setFederationNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    return profile?.email ?? "Aluno";
  }, [profile?.fullName, profile?.email]);

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
    if (profile.role !== "student") {
      router.replace("/");
    }
  }, [isBooting, session, profile, router]);

  useEffect(() => {
    if (!profile) return;
    const inferred =
      profile.firstName || profile.lastName
        ? { firstName: profile.firstName ?? "", lastName: profile.lastName ?? "" }
        : splitFullName(profile.fullName);

    setFirstName(inferred.firstName);
    setLastName(inferred.lastName);
    setBirthDate(profile.birthDate ?? "");
    setFederationNumber(profile.federationNumber ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile]);

  useEffect(() => {
    if (!profile?.id) return;
    if (profile.role !== "student") return;

    const loadAcademy = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const memberships = await dojoFlowAdapters.memberships.listByUser(profile.id);
        if (memberships.length === 0) {
          router.replace("/join-academy");
          return;
        }
        const academyData = await dojoFlowAdapters.academies.getById(memberships[0].academyId);
        setAcademy(academyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAcademy();
  }, [profile?.id, profile?.role, router]);

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await dojoFlowAdapters.profiles.upsertProfile({
        id: profile.id,
        firstName: firstName.trim() ? firstName.trim() : null,
        lastName: lastName.trim() ? lastName.trim() : null,
        birthDate: birthDate.trim() ? birthDate.trim() : null,
        federationNumber: federationNumber.trim() ? federationNumber.trim() : null,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      });
      await refresh();
      setSaveSuccess("Perfil atualizado.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Nao foi possivel salvar seu perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await dojoFlowAdapters.auth.signOut();
      router.replace("/auth");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel sair.");
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[900px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Perfil
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Seus dados
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Atualize suas informacoes pessoais. Faixa e graus sao somente leitura.
          </Text>

          {isBooting || isLoading ? (
            <Card className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando informacoes...
              </Text>
            </Card>
          ) : null}

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          <View className="mt-6 gap-4 web:flex-row">
            <Card className="flex-1">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Conta
              </Text>
              <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
                {displayName}
              </Text>
              <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                {profile?.email ?? "Email nao informado"}
              </Text>
            </Card>

            <Card className="flex-1">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Faixa e graus
              </Text>
              <View className="mt-3">
                <BeltBadge
                  belt={profile?.currentBelt ?? "Branca"}
                  degree={profile?.beltDegree ?? undefined}
                />
              </View>
              <Text className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                Somente professor/owner pode alterar.
              </Text>
            </Card>
          </View>

          <Card className="mt-6 gap-4">
            <View>
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Dados pessoais
              </Text>
              <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                Preencha seu nome, data de nascimento e numero de federacao.
              </Text>
            </View>

            <View className="gap-4">
              <TextField
                label="Nome"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Seu nome"
                autoCapitalize="words"
              />
              <TextField
                label="Sobrenome"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Seu sobrenome"
                autoCapitalize="words"
              />
              <TextField
                label="Data de nascimento"
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="AAAA-MM-DD"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />
              <TextField
                label="Numero de federacao"
                value={federationNumber}
                onChangeText={setFederationNumber}
                placeholder="Opcional"
                autoCapitalize="characters"
              />
              <TextField
                label="Avatar (URL)"
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />
            </View>

            {saveError ? <Text className="text-sm text-red-500">{saveError}</Text> : null}
            {saveSuccess ? (
              <Text className="text-sm text-emerald-600">{saveSuccess}</Text>
            ) : null}

            <Button
              label={isSaving ? "Salvando..." : "Salvar alteracoes"}
              onPress={handleSaveProfile}
              disabled={isSaving || !profile?.id}
            />
          </Card>

          <Card className="mt-6">
            <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
              Academia
            </Text>
            <Text className="mt-2 font-display text-xl text-strong-light dark:text-strong-dark">
              {academy?.name ?? "Nao vinculada"}
            </Text>
            <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
              {academy?.city ? academy.city : "Cidade nao informada"}
            </Text>
          </Card>

          <View className="mt-6">
            <Button label="Sair da conta" variant="secondary" onPress={handleSignOut} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
