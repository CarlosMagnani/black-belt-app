import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Building2, Check, Copy, Upload } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";

import { TextField } from "../components/ui/TextField";
import type { Academy } from "../src/core/ports/blackbelt-ports";
import { getErrorMessage } from "../src/core/errors/get-error-message";
import { useAuthProfile } from "../src/core/hooks/use-auth-profile";
import { blackBeltAdapters } from "../src/infra/supabase/adapters";

type Step = 1 | 2 | 3;

const TOTAL_STEPS = 4; // last step is the success screen

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatCep = (value: string) => {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatUf = (value: string) =>
  value
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 2);

const generateInviteCode = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const part = Array.from({ length: 3 })
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join("");
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${part}-${digits}`;
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

export default function CreateAcademy() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile, role } = useAuthProfile();

  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [step, setStep] = useState<Step>(1);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");

  // Step 2 (address) - UI only for now (no integration).
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [complement, setComplement] = useState("");

  // Step 3 (logo) - persisted to storage on create.
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isPickingLogo, setIsPickingLogo] = useState(false);

  // Success helpers
  const [copied, setCopied] = useState(false);

  const canProceedStep1 = useMemo(() => name.trim().length >= 3, [name]);
  const canProceedStep2 = useMemo(() => {
    const cepDigits = digitsOnly(cep);
    const uf = formatUf(stateUf);
    return (
      cepDigits.length === 8 &&
      street.trim().length > 0 &&
      neighborhood.trim().length > 0 &&
      streetNumber.trim().length > 0 &&
      city.trim().length > 0 &&
      uf.length === 2
    );
  }, [cep, street, neighborhood, streetNumber, city, stateUf]);

  // Auth/Profile guards
  useEffect(() => {
    if (isBooting) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    if (!role) {
      router.replace("/onboarding");
      return;
    }
    if (role !== "owner") {
      router.replace("/");
    }
  }, [isBooting, session, profile, role, router]);

  // Check for existing academy
  useEffect(() => {
    if (!session?.user.id || role !== "owner") return;

    const loadAcademy = async () => {
      setIsCheckingExisting(true);
      try {
        const existing = await blackBeltAdapters.academies.getByOwnerId(session.user.id);
        if (existing) setAcademy(existing);
      } catch {
        // Ignore - will show create flow
      } finally {
        setIsCheckingExisting(false);
      }
    };

    void loadAcademy();
  }, [role, session?.user.id]);

  const generateUniqueCode = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateInviteCode();
      const existing = await blackBeltAdapters.academies.getByInviteCode(code);
      if (!existing) return code;
    }
    throw new Error("Nao foi possivel gerar um codigo unico.");
  };

  const handlePickLogo = async () => {
    if (isPickingLogo) return;
    setIsPickingLogo(true);
    setError(null);
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
        setLogoUri(result.assets[0].uri);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel selecionar a imagem."));
    } finally {
      setIsPickingLogo(false);
    }
  };

  const handleCreateAcademy = async () => {
    if (!session?.user.id || role !== "owner") return;
    if (!canProceedStep1) {
      setError("Informe o nome da academia.");
      setStep(1);
      return;
    }
    if (!canProceedStep2) {
      setError("Preencha o endereco (CEP, rua, bairro, numero, cidade e estado).");
      setStep(2);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const activeSession = await blackBeltAdapters.auth.getSession();
      if (!activeSession?.user.id) {
        throw new Error("Sua sessao expirou. Faca login novamente para criar a academia.");
      }

      const ownerId = activeSession.user.id;
      let logoUrl: string | null = null;
      if (logoUri) {
        const response = await fetch(logoUri);
        const blob = await response.blob();
        const ext = guessImageExt(logoUri, (blob as unknown as { type?: string }).type ?? null);
        logoUrl = await blackBeltAdapters.storage.uploadAcademyLogo(ownerId, blob, ext);
      }

      const inviteCode = await generateUniqueCode();
      const created = await blackBeltAdapters.academies.createAcademy({
        ownerId,
        name: name.trim(),
        // Keep current backend contract: only city + logoUrl exist.
        // Full address fields are UI-only for now (no integration).
        city: city.trim() || null,
        logoUrl,
        inviteCode,
      });
      setAcademy(created);
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel criar a academia."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = async () => {
    if (!academy?.inviteCode) return;
    await Clipboard.setStringAsync(academy.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    setError(null);
    if (academy) return;
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => (prev === 2 ? 1 : 2));
  };

  const renderProgress = () => (
    <View className="mt-4 flex-row gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          className={[
            "h-1.5 flex-1 rounded-full",
            i < step ? "bg-brand-500" : "bg-subtle-dark",
          ].join(" ")}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-text-primary-dark">Sobre a academia</Text>
      <Text className="mt-2 text-sm text-text-secondary-dark">
        Informe o nome da sua academia.
      </Text>

      <View className="mt-8 gap-5">
        <TextField
          label="Nome da academia"
          value={name}
          onChangeText={(v) => setName(v)}
          placeholder="Ex: BlackBelt Centro"
          autoCapitalize="words"
          helperText="Minimo 3 caracteres"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-text-primary-dark">Endereco</Text>
      <Text className="mt-2 text-sm text-text-secondary-dark">
        Onde sua academia esta localizada
      </Text>

      <View className="mt-8 gap-5">
        <TextField
          label="CEP"
          value={cep}
          onChangeText={(v) => setCep(formatCep(v))}
          placeholder="00000-000"
          keyboardType="numeric"
        />

        <TextField
          label="Rua"
          value={street}
          onChangeText={setStreet}
          placeholder="Ex: Rua das Flores"
          autoCapitalize="words"
        />

        <View className="gap-5 web:flex-row">
          <View className="flex-1">
            <TextField
              label="Bairro"
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Ex: Centro"
              autoCapitalize="words"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Numero"
              value={streetNumber}
              onChangeText={setStreetNumber}
              placeholder="123"
              keyboardType={Platform.OS === "web" ? "default" : "numeric"}
            />
          </View>
        </View>

        <View className="gap-5 web:flex-row">
          <View className="flex-1">
            <TextField
              label="Cidade"
              value={city}
              onChangeText={setCity}
              placeholder="Ex: Sao Paulo"
              autoCapitalize="words"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Estado"
              value={stateUf}
              onChangeText={(v) => setStateUf(formatUf(v))}
              placeholder="SP"
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
        </View>

        <TextField
          label="Complemento (opcional)"
          value={complement}
          onChangeText={setComplement}
          placeholder="Ex: Sala 101"
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-text-primary-dark">Logo da academia</Text>
      <Text className="mt-2 text-sm text-text-secondary-dark">
        Adicione o logo da sua academia (opcional)
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={handlePickLogo}
        disabled={isPickingLogo}
        className={[
          "mt-10 overflow-hidden rounded-2xl border border-dashed border-subtle-dark bg-surface-dark",
          "h-44 items-center justify-center",
          isPickingLogo ? "opacity-70" : "",
        ].join(" ")}
        style={({ pressed }) => (pressed && !isPickingLogo ? { opacity: 0.9 } : undefined)}
      >
        {logoUri ? (
          <Image source={{ uri: logoUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="items-center">
            <Upload size={34} color="#94A3B8" />
            <Text className="mt-4 text-sm text-text-secondary-dark">Toque para enviar o logo</Text>
          </View>
        )}
      </Pressable>

      {logoUri ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setLogoUri(null)}
          className="mt-4 self-center py-2"
        >
          <Text className="text-sm text-text-secondary-dark underline">Remover logo</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => void handleCreateAcademy()}
          disabled={isSaving}
          className="mt-4 self-center py-2"
        >
          <Text className="text-sm text-text-secondary-dark underline">Pular esta etapa</Text>
        </Pressable>
      )}
    </View>
  );

  // Loading state
  if (isBooting || isCheckingExisting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-app-dark">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-sm text-text-muted-dark">Carregando...</Text>
      </SafeAreaView>
    );
  }

  // Success screen
  if (academy) {
    return (
      <SafeAreaView className="flex-1 bg-app-dark">
        <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/15" />
        <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10" />

        <View className="flex-1 px-6 py-6">
          <View className="mx-auto w-full max-w-[450px] flex-1 justify-center">
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-600/20">
                <Building2 size={40} color="#8B5CF6" />
              </View>

              <Text className="mt-8 font-display text-2xl font-bold text-text-primary-dark text-center">
                Sua academia foi criada!
              </Text>
              <Text className="mt-2 text-base text-text-secondary-dark text-center">
                Compartilhe o codigo abaixo com seus alunos
              </Text>

              <View className="mt-8 w-full rounded-2xl border border-subtle-dark bg-surface-dark p-6">
                <Text className="text-xs uppercase tracking-widest text-text-muted-dark text-center mb-3">
                  Codigo de acesso
                </Text>
                <Text className="font-mono text-3xl font-bold text-brand-400 text-center tracking-widest">
                  {academy.inviteCode}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleCopyCode}
                  className="mt-4 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-subtle-dark bg-app-dark"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  {copied ? (
                    <>
                      <Check size={18} color="#34D399" />
                      <Text className="text-success-dark font-medium">Copiado!</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={18} color="#8B5CF6" />
                      <Text className="text-brand-400 font-medium">Copiar codigo</Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace("/owner-home")}
                className="mt-8 w-full overflow-hidden rounded-2xl"
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <LinearGradient
                  colors={["#7C3AED", "#6366F1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-4"
                >
                  <Text className="text-center text-base font-semibold text-white">
                    Ir para Dashboard
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const nextLabel = step === 3 ? (isSaving ? "Criando..." : "Concluir") : "Proximo";
  const canProceed = step === 1 ? canProceedStep1 : step === 2 ? canProceedStep2 : !isSaving;

  return (
    <SafeAreaView className="flex-1 bg-app-dark">
      {/* Background effects */}
      <View className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-brand-600/15" />
      <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-500/10" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-6">
            <View className="mx-auto w-full max-w-[450px] flex-1">
              {/* Header */}
              <Pressable
                accessibilityRole="button"
                onPress={handleBack}
                className="flex-row items-center gap-2 self-start py-2"
              >
                <ArrowLeft size={18} color="#94A3B8" strokeWidth={2.2} />
                <Text className="text-sm text-text-secondary-dark">Voltar</Text>
              </Pressable>

              <View className="mt-3">
                <Text className="font-display text-2xl font-bold text-text-primary-dark">
                  Criar Academia
                </Text>
                {renderProgress()}
              </View>

              {/* Content */}
              {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}

              {/* Error */}
              {error ? (
                <View className="mt-6 rounded-xl bg-error-dark/20 p-4">
                  <Text className="text-sm text-error-dark">{error}</Text>
                </View>
              ) : null}

              {/* Footer buttons */}
              <View className="mt-8">
                <Pressable
                  accessibilityRole="button"
                  disabled={!canProceed || isSaving}
                  onPress={() => {
                    setError(null);
                    if (step === 1) {
                      if (!canProceedStep1) {
                        setError("Informe o nome da academia.");
                        return;
                      }
                      setStep(2);
                      return;
                    }
                    if (step === 2) {
                      if (!canProceedStep2) {
                        setError("Preencha o endereco (CEP, rua, bairro, numero, cidade e estado).");
                        return;
                      }
                      setStep(3);
                      return;
                    }
                    void handleCreateAcademy();
                  }}
                  className="overflow-hidden rounded-2xl"
                  style={({ pressed }) => ({
                    opacity: pressed && canProceed && !isSaving ? 0.9 : 1,
                  })}
                >
                  <LinearGradient
                    colors={canProceed && !isSaving ? ["#7C3AED", "#6366F1"] : ["#374151", "#374151"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-6 py-4"
                  >
                    <Text
                      className={[
                        "text-center text-base font-semibold",
                        canProceed && !isSaving ? "text-white" : "text-text-muted-dark",
                      ].join(" ")}
                    >
                      {nextLabel}
                    </Text>
                  </LinearGradient>
                </Pressable>

                {step === 3 ? (
                  <Text className="mt-4 text-xs text-text-muted-dark text-center">
                    Endereco completo ainda nao e salvo no banco. Logo e salvo no Storage.
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

