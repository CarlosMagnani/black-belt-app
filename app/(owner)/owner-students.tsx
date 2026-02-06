import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import type { BeltRank } from "../../src/core/belts/belts";
import { normalizeDegree } from "../../src/core/belts/belts";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import type { MemberProfile } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { MembersListItem } from "../../components/owner/MembersListItem";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";

export default function OwnerStudents() {
  const { academy, isLoading, error } = useOwnerAcademy();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filter, setFilter] = useState("");
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingBelt, setEditingBelt] = useState<BeltRank>({ name: "Branca", degree: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadMembers = async () => {
      setIsMembersLoading(true);
      setLocalError(null);
      try {
        const list = await blackBeltAdapters.memberships.listMembersWithProfiles(academy.id);
        if (!isActive) return;
        setMembers(list);
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

  const filtered = useMemo(() => {
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
        editingBelt.degree ?? null
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
            Atualize faixa e graus de cada aluno.
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

          <View className="mt-6">
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
          ) : filtered.length === 0 ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Nenhum aluno encontrado.
              </Text>
            </Card>
          ) : (
            <View className="mt-6 gap-4">
              {filtered.map((member) => (
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
          )}
        </View>
      </View>
    </ScrollView>
  );
}
