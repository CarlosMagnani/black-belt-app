import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import type { BeltRank } from "../../src/core/belts/belts";
import { normalizeDegree } from "../../src/core/belts/belts";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import type { MemberProfile } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { MembersListItem } from "../../components/owner/MembersListItem";
import { StudentListItem, type StudentWithPayment } from "../../components/owner/StudentListItem";
import { OverdueCounter } from "../../components/owner/OverdueCounter";
import { getPaymentStatus, type PaymentStatus } from "../../components/owner/PaymentStatusBadge";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";

type ViewMode = "payment" | "belts";

// Mock subscriptions data until migrations are ready
// TODO: Replace with real Supabase query when subscriptions table exists
const getMockSubscription = (userId: string): { status: string; next_billing_at: string | null; plan_name: string } | null => {
  // Generate deterministic mock data based on userId hash
  const hash = userId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const mod = hash % 10;
  
  if (mod < 1) return null; // 10% no subscription
  if (mod < 2) return { status: "overdue", next_billing_at: null, plan_name: "Plano Mensal" }; // 10% overdue
  if (mod < 4) {
    // 20% due soon
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (mod % 3));
    return { status: "active", next_billing_at: dueDate.toISOString(), plan_name: "Plano Mensal" };
  }
  // 60% paid
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 15 + (mod % 15));
  return { status: "active", next_billing_at: nextDate.toISOString(), plan_name: mod % 2 === 0 ? "Plano Mensal" : "Plano Trimestral" };
};

export default function OwnerStudents() {
  const router = useRouter();
  const { academy, isLoading, error } = useOwnerAcademy();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filter, setFilter] = useState("");
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingBelt, setEditingBelt] = useState<BeltRank>({ name: "Branca", degree: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("payment");

  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadMembers = async () => {
      setIsMembersLoading(true);
      setLocalError(null);
      try {
        const list = await blackBeltAdapters.memberships.listMembersWithProfiles(academy.id);
        if (!isActive) return;
        setMembers(list.filter((member) => member.role === "student"));
      } catch (err) {
        if (!isActive) return;
        setLocalError(err instanceof Error ? err.message : "Nao foi possivel carregar os alunos.");
      } finally {
        if (isActive) setIsMembersLoading(false);
      }
    };

    void loadMembers();

    return () => {
      isActive = false;
    };
  }, [academy]);

  // Convert members to students with payment status
  const studentsWithPayment = useMemo((): StudentWithPayment[] => {
    return members.map((member) => {
      // TODO: Use real subscription data when available
      const subscription = getMockSubscription(member.userId);
      const paymentStatus = getPaymentStatus(subscription);

      return {
        userId: member.userId,
        fullName: member.fullName,
        email: member.email,
        currentBelt: member.currentBelt,
        avatarUrl: member.avatarUrl,
        joinedAt: member.joinedAt,
        paymentStatus,
        planName: subscription?.plan_name ?? null,
        nextBillingAt: subscription?.next_billing_at ?? null,
      };
    });
  }, [members]);

  // Calculate overdue count
  const overdueCount = useMemo(() => {
    return studentsWithPayment.filter((s) => s.paymentStatus === "overdue").length;
  }, [studentsWithPayment]);

  // Filter students
  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return studentsWithPayment;
    return studentsWithPayment.filter((student) => {
      const value = `${student.fullName ?? ""} ${student.email ?? ""}`.toLowerCase();
      return value.includes(term);
    });
  }, [filter, studentsWithPayment]);

  // Filter members for belt editing view
  const filteredMembers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) => {
      const value = `${member.fullName ?? ""} ${member.email ?? ""}`.toLowerCase();
      return value.includes(term);
    });
  }, [filter, members]);

  const handleEdit = (member: MemberProfile) => {
    const belt = member.currentBelt ?? "Branca";
    const degree = normalizeDegree(belt, member.beltDegree ?? undefined) ?? 0;
    setEditingMemberId(member.userId);
    setEditingBelt({ name: belt, degree });
  };

  const handleCancel = () => {
    setEditingMemberId(null);
  };

  const handleSave = async (member: MemberProfile) => {
    if (!member.userId) return;
    setIsSaving(true);
    setLocalError(null);
    try {
      const updated = await blackBeltAdapters.profiles.setBeltAndDegree(
        member.userId,
        editingBelt.name,
        editingBelt.degree ?? 0
      );
      setMembers((prev) =>
        prev.map((item) =>
          item.userId === member.userId
            ? { ...item, currentBelt: updated.currentBelt, beltDegree: updated.beltDegree }
            : item
        )
      );
      setEditingMemberId(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel salvar a faixa.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStudentPress = (student: StudentWithPayment) => {
    // Find the member to enable belt editing
    const member = members.find((m) => m.userId === student.userId);
    if (member) {
      handleEdit(member);
      setViewMode("belts");
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Alunos
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Lista de alunos
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            {viewMode === "payment"
              ? "Acompanhe o status de pagamento dos alunos."
              : "Atualize faixa e graus de cada aluno."}
          </Text>

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}
          {localError ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{localError}</Text>
            </Card>
          ) : null}

          {/* View Mode Toggle */}
          <View className="mt-6 flex-row gap-2">
            <Button
              label="💳 Pagamentos"
              variant={viewMode === "payment" ? "primary" : "secondary"}
              size="sm"
              onPress={() => setViewMode("payment")}
              className="flex-1"
            />
            <Button
              label="🥋 Faixas"
              variant={viewMode === "belts" ? "primary" : "secondary"}
              size="sm"
              onPress={() => setViewMode("belts")}
              className="flex-1"
            />
          </View>

          {/* Overdue Counter (only in payment view) */}
          {viewMode === "payment" && !isLoading && !isMembersLoading && (
            <View className="mt-4">
              <OverdueCounter count={overdueCount} />
            </View>
          )}

          {/* Search */}
          <View className="mt-4">
            <TextField
              label="Buscar aluno"
              value={filter}
              onChangeText={setFilter}
              placeholder="Nome ou email"
              autoCapitalize="none"
            />
          </View>

          {isLoading || isMembersLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando alunos...
              </Text>
            </Card>
          ) : viewMode === "payment" ? (
            /* Payment Status View */
            filtered.length === 0 ? (
              <Card className="mt-6">
                <Text className="text-sm text-muted-light dark:text-muted-dark">
                  Nenhum aluno encontrado.
                </Text>
              </Card>
            ) : (
              <View className="mt-6 gap-4">
                {filtered.map((student) => (
                  <StudentListItem
                    key={student.userId}
                    student={student}
                    onPress={() => handleStudentPress(student)}
                  />
                ))}
              </View>
            )
          ) : (
            /* Belts Editing View */
            filteredMembers.length === 0 ? (
              <Card className="mt-6">
                <Text className="text-sm text-muted-light dark:text-muted-dark">
                  Nenhum aluno encontrado.
                </Text>
              </Card>
            ) : (
              <View className="mt-6 gap-4">
                {filteredMembers.map((member) => (
                  <MembersListItem
                    key={member.userId}
                    member={member}
                    isEditing={editingMemberId === member.userId}
                    isSaving={isSaving && editingMemberId === member.userId}
                    beltValue={editingBelt}
                    onChangeBelt={setEditingBelt}
                    onEdit={() => handleEdit(member)}
                    onCancel={handleCancel}
                    onSave={() => handleSave(member)}
                  />
                ))}
              </View>
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
}
