import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";

import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DateInput } from "../../components/ui/DateInput";
import { Select } from "../../components/ui/Select";
import { TextField } from "../../components/ui/TextField";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { BeltBadge } from "../../src/ui/belts/BeltBadge";

const SEX_OPTIONS = [
  { label: "Masculino", value: "M" },
  { label: "Feminino", value: "F" },
  { label: "Outro", value: "O" },
  { label: "Prefiro nao informar", value: "N" },
];

const splitFullName = (fullName?: string | null) => {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const [first, ...rest] = parts;
  return { firstName: first, lastName: rest.join(" ") };
};

const guessImageExt = (localUri: string, mimeType?: string | null): string => {
  const guessFromMime = (mime?: string | null): string | null => {
    const value = (mime ?? "").toLowerCase();
    if (!value.startsWith("image/")) return null;
    const subtype = value.slice("image/".length);
    if (subtype === "jpeg" || subtype === "jpg") return "jpg";
    if (subtype === "png") return "png";
    if (subtype === "webp") return "webp";
    if (subtype === "gif") return "gif";
    if (subtype === "heic") return "heic";
    if (subtype === "heif") return "heif";
    return null;
  };

  const guessFromUri = (uri: string): string | null => {
    const match = uri.toLowerCase().match(/\.([a-z0-9]{1,10})(?:$|[?#])/);
    if (!match?.[1]) return null;
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    if (!/^[a-z0-9]{1,10}$/.test(ext)) return null;
    return ext;
  };

  return guessFromMime(mimeType) ?? guessFromUri(localUri) ?? "jpg";
};

export default function OwnerSettings() {
  const { academy, isLoading: isAcademyLoading, error: academyError, refresh: refreshAcademy } =
    useOwnerAcademy();
  const { profile, isLoading: isProfileLoading, refresh: refreshProfile } = useAuthProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [federationNumber, setFederationNumber] = useState("");
  const [ownerAvatarUrl, setOwnerAvatarUrl] = useState("");

  const [academyName, setAcademyName] = useState("");
  const [academyCity, setAcademyCity] = useState("");
  const [academyLogoUrl, setAcademyLogoUrl] = useState("");
  const [academyLogoLocalUri, setAcademyLogoLocalUri] = useState<string | null>(null);

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAcademySaving, setIsAcademySaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [academySaveError, setAcademySaveError] = useState<string | null>(null);
  const [academySaveSuccess, setAcademySaveSuccess] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);

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
    setOwnerAvatarUrl(profile.avatarUrl ?? "");
  }, [profile]);

  useEffect(() => {
    if (!academy) return;
    setAcademyName(academy.name);
    setAcademyCity(academy.city ?? "");
    setAcademyLogoUrl(academy.logoUrl ?? "");
    setAcademyLogoLocalUri(null);
  }, [academy]);

  const displayName = useMemo(() => {
    const value = `${firstName} ${lastName}`.trim();
    if (value) return value;
    if (profile?.fullName?.trim()) return profile.fullName.trim();
    return profile?.email ?? "Owner";
  }, [firstName, lastName, profile?.email, profile?.fullName]);

  const academyLogoPreview = academyLogoLocalUri ?? (academyLogoUrl || null);
  const isLoading = isAcademyLoading || isProfileLoading;

  const handleOwnerAvatarSelected = async (localUri: string) => {
    if (!profile?.id) return;
    setIsAvatarUploading(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const fileExt = guessImageExt(localUri, (blob as unknown as { type?: string }).type ?? null);
      const publicUrl = await blackBeltAdapters.storage.uploadAvatar(profile.id, blob, fileExt);

      setOwnerAvatarUrl(publicUrl);
      await blackBeltAdapters.profiles.upsertProfile({
        id: profile.id,
        avatarUrl: publicUrl,
      });
      await refreshProfile();
      setProfileSuccess("Foto do owner atualizada.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Nao foi possivel atualizar a foto.");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handlePickAcademyLogo = async () => {
    if (isLogoUploading) return;
    setIsLogoUploading(true);
    setAcademySaveError(null);
    setAcademySaveSuccess(null);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setAcademyLogoLocalUri(result.assets[0].uri);
      }
    } catch (err) {
      setAcademySaveError(err instanceof Error ? err.message : "Nao foi possivel selecionar o logo.");
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const normalizedFirstName = firstName.trim();
      const normalizedLastName = lastName.trim();
      const fullName = `${normalizedFirstName} ${normalizedLastName}`.trim();

      await blackBeltAdapters.profiles.upsertProfile({
        id: profile.id,
        firstName: normalizedFirstName || undefined,
        lastName: normalizedLastName || null,
        fullName: fullName || undefined,
        birthDate: birthDate.trim() || null,
        sex: (sex as "M" | "F" | "O" | "N") || null,
        federationNumber: federationNumber.trim() || null,
        avatarUrl: ownerAvatarUrl.trim() || null,
      });

      await refreshProfile();
      setProfileSuccess("Perfil do owner atualizado.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Nao foi possivel salvar o perfil.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleSaveAcademy = async () => {
    if (!academy) return;
    const trimmedName = academyName.trim();
    if (trimmedName.length < 3) {
      setAcademySaveError("Nome da academia deve ter pelo menos 3 caracteres.");
      return;
    }

    setIsAcademySaving(true);
    setAcademySaveError(null);
    setAcademySaveSuccess(null);
    try {
      let logoUrlToSave = academyLogoUrl.trim() || null;

      if (academyLogoLocalUri) {
        const response = await fetch(academyLogoLocalUri);
        const blob = await response.blob();
        const fileExt = guessImageExt(
          academyLogoLocalUri,
          (blob as unknown as { type?: string }).type ?? null
        );
        logoUrlToSave = await blackBeltAdapters.storage.uploadAcademyLogo(
          academy.ownerId,
          blob,
          fileExt
        );
      }

      const updated = await blackBeltAdapters.academies.updateAcademy({
        id: academy.id,
        name: trimmedName,
        city: academyCity.trim() || null,
        logoUrl: logoUrlToSave,
      });

      setAcademyName(updated.name);
      setAcademyCity(updated.city ?? "");
      setAcademyLogoUrl(updated.logoUrl ?? "");
      setAcademyLogoLocalUri(null);
      await refreshAcademy();
      setAcademySaveSuccess("Configuracoes da academia atualizadas.");
    } catch (err) {
      setAcademySaveError(
        err instanceof Error ? err.message : "Nao foi possivel salvar a academia."
      );
    } finally {
      setIsAcademySaving(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!academy?.inviteCode) return;
    try {
      await Clipboard.setStringAsync(academy.inviteCode);
      setCopyMessage("Codigo copiado.");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Copie o codigo manualmente.");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const handleSignOut = async () => {
    setSignOutError(null);
    try {
      await blackBeltAdapters.auth.signOut();
      // AuthGate handles redirect.
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Nao foi possivel sair.");
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[920px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Configuracoes do owner
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Perfil e academia
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Edite o perfil do owner separado das configuracoes da academia.
          </Text>

          {academyError ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{academyError}</Text>
            </Card>
          ) : null}

          {isLoading ? (
            <Card className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator color="#6366F1" />
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando dados...
              </Text>
            </Card>
          ) : null}

          <Card className="mt-6 gap-5">
            <View className="items-center">
              <Avatar
                uri={ownerAvatarUrl}
                name={displayName}
                size="xl"
                editable
                onImageSelected={handleOwnerAvatarSelected}
              />
              {isAvatarUploading ? (
                <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                  Enviando foto...
                </Text>
              ) : null}
              <Text className="mt-4 font-display text-2xl text-strong-light dark:text-strong-dark">
                {displayName}
              </Text>
              <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
                {profile?.email ?? "Email nao informado"}
              </Text>
            </View>

            <Card className="items-center bg-surface-light dark:bg-surface-dark">
              <Text className="mb-3 text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Faixa atual
              </Text>
              <BeltBadge
                belt={profile?.currentBelt ?? "Preta"}
                degree={profile?.beltDegree ?? undefined}
              />
              <Text className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                Faixa alterada apenas em fluxo de graduacao
              </Text>
            </Card>

            <View className="gap-3 web:flex-row">
              <View className="flex-1">
                <TextField
                  label="Nome"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Nome"
                  autoCapitalize="words"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Sobrenome"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Sobrenome"
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
              label="Numero da federacao"
              value={federationNumber}
              onChangeText={setFederationNumber}
              placeholder="Ex: CBJJ12345"
              autoCapitalize="characters"
            />

            {profileError ? (
              <View className="rounded-lg bg-red-500/10 p-3">
                <Text className="text-sm text-red-400">{profileError}</Text>
              </View>
            ) : null}
            {profileSuccess ? (
              <View className="rounded-lg bg-emerald-500/10 p-3">
                <Text className="text-sm text-emerald-600">{profileSuccess}</Text>
              </View>
            ) : null}

            <Button
              label={isProfileSaving ? "Salvando perfil..." : "Salvar perfil do owner"}
              onPress={handleSaveProfile}
              disabled={isProfileSaving || !profile?.id}
            />
          </Card>

          <Card className="mt-6 gap-5">
            <View>
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Configuracoes da academia
              </Text>
              <Text className="mt-2 font-display text-2xl text-strong-light dark:text-strong-dark">
                Configuracoes da academia
              </Text>
            </View>

            <View className="items-center gap-3">
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
                {academyLogoPreview ? (
                  <Image source={{ uri: academyLogoPreview }} className="h-full w-full" />
                ) : (
                  <Text className="text-sm text-muted-light dark:text-muted-dark">Sem logo</Text>
                )}
              </View>
              <View className="w-full gap-2 web:flex-row">
                <Button
                  label={isLogoUploading ? "Carregando..." : "Escolher logo"}
                  variant="secondary"
                  className="flex-1"
                  onPress={() => void handlePickAcademyLogo()}
                  disabled={isLogoUploading || isAcademySaving}
                />
                <Button
                  label="Remover logo"
                  variant="ghost"
                  className="flex-1"
                  onPress={() => {
                    setAcademyLogoLocalUri(null);
                    setAcademyLogoUrl("");
                  }}
                  disabled={isAcademySaving}
                />
              </View>
            </View>

            <TextField
              label="Nome da academia"
              value={academyName}
              onChangeText={setAcademyName}
              placeholder="Nome da academia"
              autoCapitalize="words"
            />

            <TextField
              label="Cidade"
              value={academyCity}
              onChangeText={setAcademyCity}
              placeholder="Cidade"
              autoCapitalize="words"
            />

            <Card className="bg-surface-light dark:bg-surface-dark">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Invite code
              </Text>
              <Text className="mt-2 font-display text-2xl tracking-[2px] text-strong-light dark:text-strong-dark">
                {academy?.inviteCode ?? "---"}
              </Text>
              <View className="mt-3">
                <Button
                  label="Copiar codigo"
                  variant="secondary"
                  onPress={() => void handleCopyInviteCode()}
                />
              </View>
              {copyMessage ? (
                <Text className="mt-2 text-xs text-emerald-600">{copyMessage}</Text>
              ) : null}
            </Card>

            {academySaveError ? (
              <View className="rounded-lg bg-red-500/10 p-3">
                <Text className="text-sm text-red-400">{academySaveError}</Text>
              </View>
            ) : null}
            {academySaveSuccess ? (
              <View className="rounded-lg bg-emerald-500/10 p-3">
                <Text className="text-sm text-emerald-600">{academySaveSuccess}</Text>
              </View>
            ) : null}

            <Button
              label={isAcademySaving ? "Salvando academia..." : "Salvar academia"}
              onPress={handleSaveAcademy}
              disabled={isAcademySaving || !academy}
            />
          </Card>

          {signOutError ? (
            <View className="mt-4 rounded-lg bg-red-500/10 p-3">
              <Text className="text-sm text-red-400">{signOutError}</Text>
            </View>
          ) : null}
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
