import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { PlanCard, type Plan, type Periodicity } from "../../components/owner/PlanCard";
import { CreatePlanModal, type PlanFormData } from "../../components/owner/CreatePlanModal";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

// Mock data until migrations are ready
// TODO: Replace with real Supabase query when academy_plans table exists
const MOCK_PLANS: Plan[] = [
  {
    id: "1",
    name: "Plano Mensal",
    description: "Acesso completo às aulas",
    price_cents: 15000,
    periodicity: "MENSAL",
    is_active: true,
    subscriber_count: 12,
  },
  {
    id: "2",
    name: "Plano Trimestral",
    description: "3 meses com desconto",
    price_cents: 40000,
    periodicity: "TRIMESTRAL",
    is_active: true,
    subscriber_count: 8,
  },
  {
    id: "3",
    name: "Plano Semestral",
    description: "6 meses com desconto especial",
    price_cents: 70000,
    periodicity: "SEMESTRAL",
    is_active: true,
    subscriber_count: 5,
  },
  {
    id: "4",
    name: "Plano Anual",
    description: "Melhor custo-benefício",
    price_cents: 120000,
    periodicity: "ANUAL",
    is_active: false,
    subscriber_count: 2,
  },
];

export default function OwnerPlans() {
  const { academy, isLoading: isAcademyLoading, error: academyError } = useOwnerAcademy();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!academy) return;
    loadPlans();
  }, [academy]);

  const loadPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with real Supabase query
      // const { data, error } = await supabase
      //   .from('academy_plans')
      //   .select('*, subscriptions(count)')
      //   .eq('academy_id', academy.id)
      //   .order('price_cents', { ascending: true });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPlans(MOCK_PLANS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar planos");
    } finally {
      setIsLoading(false);
    }
  };

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
    
    try {
      if (editingPlan) {
        // TODO: Replace with real Supabase update
        // await supabase
        //   .from('academy_plans')
        //   .update({
        //     name: data.name,
        //     description: data.description,
        //     price_cents: data.price_cents,
        //     periodicity: data.periodicity,
        //   })
        //   .eq('id', editingPlan.id);

        // Mock update
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingPlan.id
              ? { ...p, ...data }
              : p
          )
        );
      } else {
        // TODO: Replace with real Supabase insert
        // const { data: newPlan } = await supabase
        //   .from('academy_plans')
        //   .insert({
        //     academy_id: academy.id,
        //     ...data,
        //     is_active: true,
        //   })
        //   .select()
        //   .single();

        // Mock create
        const newPlan: Plan = {
          id: Date.now().toString(),
          ...data,
          is_active: true,
          subscriber_count: 0,
        };
        setPlans((prev) => [...prev, newPlan]);
      }

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar plano");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      // TODO: Replace with real Supabase update
      // await supabase
      //   .from('academy_plans')
      //   .update({ is_active: !plan.is_active })
      //   .eq('id', plan.id);

      // Mock toggle
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id
            ? { ...p, is_active: !p.is_active }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar plano");
    }
  };

  const activePlans = plans.filter((p) => p.is_active);
  const inactivePlans = plans.filter((p) => !p.is_active);
  const totalSubscribers = plans.reduce((sum, p) => sum + (p.subscriber_count ?? 0), 0);

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
                  {inactivePlans.length > 0 && (
                    <Text className="text-xs text-muted-light dark:text-muted-dark">
                      {inactivePlans.length} inativos
                    </Text>
                  )}
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
                <Text className="text-4xl">📋</Text>
                <Text className="text-center text-sm text-muted-light dark:text-muted-dark">
                  Nenhum plano cadastrado ainda.{"\n"}
                  Crie seu primeiro plano para começar a receber assinaturas.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* Active Plans */}
              {activePlans.length > 0 && (
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
              )}

              {/* Inactive Plans */}
              {inactivePlans.length > 0 && (
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
              )}
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
