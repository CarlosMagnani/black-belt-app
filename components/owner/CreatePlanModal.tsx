import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Button } from "../ui/Button";
import { Modal as AppModal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { TextField } from "../ui/TextField";
import type { Periodicity, Plan } from "./PlanCard";

type CreatePlanModalProps = {
  visible: boolean;
  plan?: Plan | null;
  onClose: () => void;
  onSave: (data: PlanFormData) => Promise<void>;
  isSaving?: boolean;
};

export type PlanFormData = {
  name: string;
  description: string;
  price_cents: number;
  periodicity: Periodicity;
};

const PERIODICITY_OPTIONS = [
  { label: "Mensal", value: "MENSAL" },
  { label: "Trimestral", value: "TRIMESTRAL" },
  { label: "Semestral", value: "SEMESTRAL" },
  { label: "Anual", value: "ANUAL" },
];

const parseCurrencyInput = (value: string): number => {
  // Keep only digits + decimal separators.
  const cleaned = value.replace(/[^\d.,]/g, "");
  const normalized = cleaned.replace(",", ".");
  const floatValue = parseFloat(normalized) || 0;
  return Math.round(floatValue * 100);
};

const formatCurrencyInput = (cents: number): string => {
  if (cents === 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
};

export function CreatePlanModal({
  visible,
  plan,
  onClose,
  onSave,
  isSaving,
}: CreatePlanModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" || width >= 768;
  const isEditing = !!plan;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [periodicity, setPeriodicity] = useState<Periodicity>("MENSAL");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) return;
    if (plan) {
      setName(plan.name);
      setDescription(plan.description ?? "");
      setPriceInput(formatCurrencyInput(plan.price_cents));
      setPeriodicity(plan.periodicity);
    } else {
      setName("");
      setDescription("");
      setPriceInput("");
      setPeriodicity("MENSAL");
    }
    setErrors({});
  }, [visible, plan]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (name.trim().length < 3) {
      next.name = "Nome deve ter pelo menos 3 caracteres";
    }

    const priceCents = parseCurrencyInput(priceInput);
    if (priceCents <= 0) {
      next.price = "Valor deve ser maior que zero";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData: PlanFormData = {
      name: name.trim(),
      description: description.trim(),
      price_cents: parseCurrencyInput(priceInput),
      periodicity,
    };

    await onSave(formData);
  };

  const title = useMemo(() => (isEditing ? "Editar Plano" : "Novo Plano"), [isEditing]);

  const content = (
    <View className="gap-4">
      <TextField
        label="Nome do plano"
        value={name}
        onChangeText={setName}
        placeholder="Ex: Plano Mensal"
        errorMessage={errors.name}
      />

      <TextField
        label="Descricao (opcional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Descricao do plano"
        multiline
        numberOfLines={2}
      />

      <TextField
        label="Valor (R$)"
        value={priceInput}
        onChangeText={setPriceInput}
        placeholder="0,00"
        keyboardType="decimal-pad"
        errorMessage={errors.price}
      />

      <Select
        label="Periodicidade"
        value={periodicity}
        options={PERIODICITY_OPTIONS}
        onValueChange={(v) => setPeriodicity(v as Periodicity)}
      />

      <View className="mt-2 flex-row gap-3">
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={onClose}
          disabled={isSaving}
          className="flex-1"
        />
        <Button
          label={isSaving ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
          onPress={handleSave}
          disabled={isSaving}
          className="flex-1"
        />
      </View>
    </View>
  );

  if (isDesktop) {
    // Desktop/web: use the centered app modal so the form doesn't stretch full width.
    return (
      <AppModal visible={visible} onClose={onClose} title={title} maxWidth="lg">
        {content}
      </AppModal>
    );
  }

  // Mobile: keep bottom-sheet behavior.
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="max-h-[90%] rounded-t-3xl bg-surface-light p-6 dark:bg-surface-dark">
              <View className="mb-4 items-center">
                <View className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
              </View>

              <Text className="mb-6 font-display text-xl text-strong-light dark:text-strong-dark">
                {title}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {content}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

