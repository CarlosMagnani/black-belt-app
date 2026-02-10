import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { PlanCard, type Plan, type Periodicity } from "../../components/owner/PlanCard";
import { CreatePlanModal, type PlanFormData } from "../../components/owner/CreatePlanModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { supabase } from "../../src/infra/supabase/client";

type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  periodicity: Periodicity;
  is_active: boolean;
};

const toPlan = (row: PlanRow): Plan => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price_cents: row.price_cents,
  periodicity: row.periodicity,
  is_active: row.is_active,
  subscriber_count: 0,
});

export default function OwnerPlans() {
  const { academy, isLoading: isAcademyLoading, error: academyError } = useOwnerAcademy();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadPlans = useCallback(async (academyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: selectError } = await supabase
        .from("academy_plans")
        .select("id, name, description, price_cents, periodicity, is_active")
        .eq("academy_id", academyId)
        .order("price_cents", { ascending: true });

      if (selectError) throw selectError;

      const rows = (data as PlanRow[] | null) ?? [];
      setPlans(rows.map(toPlan));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar planos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!academy) return;
    void loadPlans(academy.id);
  }, [academy?.id, loadPlans]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingPlan(null);
  };

  const handleSave = async (data: PlanFormData) => {
    if (!academy) return;
    setIsSaving(true);
    setError(null);

    try {
      if (editingPlan) {
        const { data: updated, error: updateError } = await supabase
          .from("academy_plans")
          .update({
            name: data.name,
            description: data.description.trim() ? data.description.trim() : null,
            price_cents: data.price_cents,
            periodicity: data.periodicity,
          })
          .eq("id", editingPlan.id)
          .select("id, name, description, price_cents, periodicity, is_active")
          .single();

        if (updateError) throw updateError;
        if (!updated) throw new Error("Plano nao encontrado.");

        const updatedPlan = toPlan(updated as PlanRow);

        setPlans((prev) =>
          prev
            .map((p) => (p.id === editingPlan.id ? { ...p, ...updatedPlan } : p))
            .sort((a, b) => a.price_cents - b.price_cents)
        );
      } else {
        const { data: created, error: insertError } = await supabase
          .from("academy_plans")
          .insert({
            academy_id: academy.id,
            name: data.name,
            description: data.description.trim() ? data.description.trim() : null,
            price_cents: data.price_cents,
            periodicity: data.periodicity,
            is_active: true,
          })
          .select("id, name, description, price_cents, periodicity, is_active")
          .single();

        if (insertError) throw insertError;
        if (!created) throw new Error("Nao foi possivel criar o plano.");

        setPlans((prev) =>
          [...prev, toPlan(created as PlanRow)].sort((a, b) => a.price_cents - b.price_cents)
        );
      }

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar plano");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    setError(null);
    try {
      const { data: updated, error: updateError } = await supabase
        .from("academy_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id)
        .select("id, name, description, price_cents, periodicity, is_active")
        .single();

      if (updateError) throw updateError;
      if (!updated) throw new Error("Plano nao encontrado.");

      const updatedPlan = toPlan(updated as PlanRow);

      setPlans((prev) =>
        prev
          .map((p) => (p.id === plan.id ? { ...p, ...updatedPlan } : p))
          .sort((a, b) => a.price_cents - b.price_cents)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar plano");
    }
  };

  const activePlans = useMemo(() => plans.filter((p) => p.is_active), [plans]);
  const inactivePlans = useMemo(() => plans.filter((p) => !p.is_active), [plans]);
  const totalSubscribers = useMemo(
    () => plans.reduce((sum, p) => sum + (p.subscriber_count ?? 0), 0),
    [plans]
  );

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Planos
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Gerenciar planos
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Configure os planos de assinatura da sua academia.
          </Text>

          {(academyError || error) && (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{academyError || error}</Text>
            </Card>
          )}

          {/* Summary Card */}
          {!isLoading && !isAcademyLoading && (
            <Card className="mt-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs uppercase tracking-wide text-muted-light dark:text-muted-dark">
                    Total de assinantes
                  </Text>
                  <Text className="font-display text-2xl text-strong-light dark:text-strong-dark">
                    {totalSubscribers}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-muted-light dark:text-muted-dark">
                    {activePlans.length} planos ativos
                  </Text>
                  {inactivePlans.length > 0 ? (
                    <Text className="text-xs text-muted-light dark:text-muted-dark">
                      {inactivePlans.length} inativos
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>
          )}

          {/* Create Button */}
          <View className="mt-6">
            <Button
              label="+ Criar novo plano"
              onPress={handleOpenCreate}
              disabled={isLoading || isAcademyLoading}
            />
          </View>

          {isLoading || isAcademyLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando planos...
              </Text>
            </Card>
          ) : plans.length === 0 ? (
            <Card className="mt-6">
              <View className="items-center gap-2 py-4">
                <Text className="text-center text-sm text-muted-light dark:text-muted-dark">
                  Nenhum plano cadastrado ainda.{"\n"}
                  Crie seu primeiro plano para comecar a receber assinaturas.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* Active Plans */}
              {activePlans.length > 0 ? (
                <View className="mt-6 gap-4">
                  <Text className="text-xs uppercase tracking-wide text-muted-light dark:text-muted-dark">
                    Planos ativos
                  </Text>
                  {activePlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={() => handleOpenEdit(plan)}
                      onToggleActive={() => handleToggleActive(plan)}
                    />
                  ))}
                </View>
              ) : null}

              {/* Inactive Plans */}
              {inactivePlans.length > 0 ? (
                <View className="mt-6 gap-4">
                  <Text className="text-xs uppercase tracking-wide text-muted-light dark:text-muted-dark">
                    Planos inativos
                  </Text>
                  {inactivePlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={() => handleOpenEdit(plan)}
                      onToggleActive={() => handleToggleActive(plan)}
                    />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>
      </View>

      {/* Create/Edit Modal */}
      <CreatePlanModal
        visible={isModalVisible}
        plan={editingPlan}
        onClose={handleCloseModal}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </ScrollView>
  );
}
