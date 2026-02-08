import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DateInput } from "../../components/ui/DateInput";
import { Select } from "../../components/ui/Select";
import { TextField } from "../../components/ui/TextField";
import { getErrorMessage } from "../../src/core/errors/get-error-message";
import { useStudentAcademy } from "../../src/core/hooks/use-student-academy";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";

import { BeltBadge } from "../../src/ui/belts/BeltBadge";

const SEX_OPTIONS = [
  { label: "Masculino", value: "M" },
  { label: "Feminino", value: "F" },
  { label: "Outro", value: "O" },
  { label: "Prefiro não informar", value: "N" },
];

const splitFullName = (fullName?: string | null) => {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const [first, ...rest] = parts;
  return { firstName: first, lastName: rest.join(" ") };
};

export default function Profile() {
  const {
    isBooting,
    profile,
    academy,
    isAcademyLoading,
    error: academyError,
    refreshProfile,
  } = useStudentAcademy();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [federationNumber, setFederationNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const displayName = useMemo(() => {
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    if (profile?.fullName) return profile.fullName;
    return profile?.email ?? "Aluno";
  }, [firstName, lastName, profile?.fullName, profile?.email]);

  useEffect(() => {
    if (!profile) return;
    const inferred =
      profile.firstName || profile.lastName
        ? { firstName: profile.firstName ?? "", lastName: profile.lastName ?? "" }
        : splitFullName(profile.fullName);

    setFirstName(inferred.firstName);
    setLastName(inferred.lastName);
    setBirthDate(profile.birthDate ?? "");
    setSex(profile.sex ?? "");
    setFederationNumber(profile.federationNumber ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile]);

  const handleAvatarSelected = async (localUri: string) => {
    if (!profile?.id) return;

    setIsUploading(true);
    setSaveError(null);

    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const fileExt = localUri.split(".").pop()?.toLowerCase() ?? "jpg";

      const publicUrl = await blackBeltAdapters.storage.uploadAvatar(
        profile.id,
        blob,
        fileExt
      );
      setAvatarUrl(publicUrl);

      // Save to profile
      await blackBeltAdapters.profiles.upsertProfile({
        id: profile.id,
        avatarUrl: publicUrl,
      });

      await refreshProfile();
      setSaveSuccess("Foto atualizada!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setSaveError(getErrorMessage(err, "Nao foi possivel fazer upload da foto."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await blackBeltAdapters.profiles.upsertProfile({
        id: profile.id,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        birthDate: birthDate.trim() || null,
        sex: (sex as "M" | "F" | "O" | "N") || null,
        federationNumber: federationNumber.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      await refreshProfile();
      setSaveSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      setSaveError(getErrorMessage(err, "Nao foi possivel salvar seu perfil."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await blackBeltAdapters.auth.signOut();
      // AuthGate handles redirect
    } catch (err) {
      setSaveError(getErrorMessage(err, "Nao foi possivel sair."));
    }
  };

  const isLoading = isBooting || isAcademyLoading;

  return (
    <ScrollView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="px-page pb-10 pt-6">
        <View className="mx-auto w-full max-w-[600px]">
          {/* Header */}
          <View className="items-center">
            <Avatar
              uri={avatarUrl}
              name={displayName}
              size="xl"
              editable
              onImageSelected={handleAvatarSelected}
            />
            {isUploading && (
              <Text className="mt-2 text-sm text-brand-400">Enviando foto...</Text>
            )}
            <Text className="mt-4 font-display text-2xl font-semibold text-strong-light dark:text-strong-dark">
              {displayName}
            </Text>
            <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
              {profile?.email ?? "Email não informado"}
            </Text>
          </View>

          {/* Belt Card */}
          <Card className="mt-6 items-center bg-surface-light dark:bg-surface-dark">
            <Text className="mb-3 text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
              Faixa atual
            </Text>
            <BeltBadge
              belt={profile?.currentBelt ?? "Branca"}
              degree={profile?.beltDegree ?? undefined}
            />
            <Text className="mt-3 text-xs text-muted-light dark:text-muted-dark">
              Alterada apenas pelo professor
            </Text>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="mt-6 flex-row items-center gap-3 bg-surface-light dark:bg-surface-dark">
              <ActivityIndicator color="#6366F1" />
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando informações...
              </Text>
            </Card>
          )}

          {/* Error State */}
          {academyError && (
            <Card className="mt-6 bg-red-500/10">
              <Text className="text-sm text-red-400">{academyError}</Text>
            </Card>
          )}

          {/* Personal Data Form */}
          <Card className="mt-6 gap-5 bg-surface-light dark:bg-surface-dark">
            <View>
              <Text className="text-lg font-semibold text-strong-light dark:text-strong-dark">
                Dados pessoais
              </Text>
              <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
                Mantenha suas informações atualizadas
              </Text>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="Nome"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Seu nome"
                  autoCapitalize="words"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Sobrenome"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Seu sobrenome"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <DateInput
              label="Data de nascimento"
              value={birthDate}
              onChangeDate={setBirthDate}
            />

            <Select
              label="Sexo"
              value={sex}
              options={SEX_OPTIONS}
              onValueChange={setSex}
              placeholder="Selecione..."
            />

            <TextField
              label="Número da federação"
              value={federationNumber}
              onChangeText={setFederationNumber}
              placeholder="Ex: CBJJ12345"
              autoCapitalize="characters"
              helperText="CBJJ, IBJJF ou outra federação"
            />

            {/* Feedback Messages */}
            {saveError && (
              <View className="rounded-lg bg-red-500/10 p-3">
                <Text className="text-sm text-red-400">{saveError}</Text>
              </View>
            )}
            {saveSuccess && (
              <View className="rounded-lg bg-green-500/10 p-3">
                <Text className="text-sm text-green-400">{saveSuccess}</Text>
              </View>
            )}

            <Button
              label={isSaving ? "Salvando..." : "Salvar alterações"}
              onPress={handleSaveProfile}
              disabled={isSaving || !profile?.id}
            />
          </Card>

          {/* Academy Card */}
          <Card className="mt-6 bg-surface-light dark:bg-surface-dark">
            <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
              Academia
            </Text>
            <Text className="mt-2 font-display text-xl font-semibold text-strong-light dark:text-strong-dark">
              {academy?.name ?? "Não vinculada"}
            </Text>
            {academy?.city && (
              <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
                📍 {academy.city}
              </Text>
            )}
          </Card>

          {/* Sign Out */}
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
