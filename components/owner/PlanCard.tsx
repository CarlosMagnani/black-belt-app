import React from "react";
import { Pressable, Text, View } from "react-native";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export type Periodicity = "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";

export type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price_cents: number;
  periodicity: Periodicity;
  is_active: boolean;
  subscriber_count?: number;
};

type PlanCardProps = {
  plan: Plan;
  onEdit?: () => void;
  onToggleActive?: () => void;
  className?: string;
};

const PERIODICITY_LABELS: Record<Periodicity, string> = {
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export function PlanCard({ plan, onEdit, onToggleActive, className }: PlanCardProps) {
  const periodLabel = PERIODICITY_LABELS[plan.periodicity] ?? plan.periodicity;

  return (
    <Card className={["gap-3", className ?? ""].join(" ")}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
              {plan.name}
            </Text>
            {!plan.is_active && (
              <View className="rounded bg-gray-200 px-2 py-0.5 dark:bg-gray-700">
                <Text className="text-xs text-gray-600 dark:text-gray-400">Inativo</Text>
              </View>
            )}
          </View>
          {plan.description && (
            <Text className="mt-1 text-sm text-muted-light dark:text-muted-dark">
              {plan.description}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="font-display text-xl text-brand-600">
            {formatCurrency(plan.price_cents)}
          </Text>
          <Text className="text-xs text-muted-light dark:text-muted-dark">{periodLabel}</Text>
        </View>
      </View>

      {/* Subscriber count */}
      <View className="flex-row items-center gap-2 rounded-lg bg-app-light px-3 py-2 dark:bg-app-dark">
        <Text className="text-lg">👥</Text>
        <Text className="text-sm text-muted-light dark:text-muted-dark">
          {plan.subscriber_count ?? 0}{" "}
          {(plan.subscriber_count ?? 0) === 1 ? "aluno inscrito" : "alunos inscritos"}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        <Button
          label="Editar"
          variant="secondary"
          size="sm"
          onPress={onEdit}
          className="flex-1"
        />
        <Button
          label={plan.is_active ? "Desativar" : "Ativar"}
          variant={plan.is_active ? "ghost" : "primary"}
          size="sm"
          onPress={onToggleActive}
          className="flex-1"
        />
      </View>
    </Card>
  );
}
