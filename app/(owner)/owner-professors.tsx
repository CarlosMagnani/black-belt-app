import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { supabase } from "../../src/infra/supabase/client";

type StaffRole = "owner" | "professor";

type StaffMember = {
  userId: string;
  role: StaffRole;
  fullName: string | null;
  email: string | null;
};

export default function OwnerProfessors() {
  const { academy, isLoading, error } = useOwnerAcademy();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().includes("@") && !isSaving, [email, isSaving]);

  const loadStaff = async () => {
    if (!academy) return;
    setIsListLoading(true);
    setLocalError(null);
    try {
      type StaffRow = {
        user_id: string;
        role: StaffRole;
        profiles: { full_name: string | null; email: string | null } | null;
      };

      const { data, error: staffError } = await supabase
        .from("academy_staff")
        .select("user_id, role, profiles:profiles (full_name, email)")
        .eq("academy_id", academy.id)
        .order("created_at", { ascending: true });

      if (staffError) throw staffError;

      const rows = (data as StaffRow[] | null) ?? [];
      setMembers(
        rows.map((row) => ({
          userId: row.user_id,
          role: row.role,
          fullName: row.profiles?.full_name ?? null,
          email: row.profiles?.email ?? null,
        }))
      );
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel carregar professores.");
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academy?.id]);

  const handleAdd = async () => {
    if (!academy) return;
    if (!canSubmit) return;
    setIsSaving(true);
    setLocalError(null);
    setSuccessMessage(null);
    try {
      const trimmed = email.trim();
      const { error: rpcError } = await supabase.rpc("add_professor_to_academy", {
        p_academy_id: academy.id,
        p_email: trimmed,
      });
      if (rpcError) throw rpcError;
      setEmail("");
      setSuccessMessage("Professor adicionado.");
      await loadStaff();
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel adicionar professor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!academy) return;
    setIsSaving(true);
    setLocalError(null);
    setSuccessMessage(null);
    try {
      const { error: deleteError } = await supabase
        .from("academy_staff")
        .delete()
        .eq("academy_id", academy.id)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;
      setSuccessMessage("Professor removido.");
      await loadStaff();
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel remover professor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[900px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Professores
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Equipe da academia
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Adicione professores para validarem check-ins nas aulas atribuidas a eles.
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
          {successMessage ? (
            <Card className="mt-6">
              <Text className="text-sm text-emerald-600">{successMessage}</Text>
            </Card>
          ) : null}

          <Card className="mt-6 gap-3">
            <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
              Adicionar professor
            </Text>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="professor@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Button
              label={isSaving ? "Salvando..." : "Adicionar"}
              onPress={handleAdd}
              disabled={!canSubmit}
            />
          </Card>

          {isLoading || isListLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando professores...
              </Text>
            </Card>
          ) : members.filter((m) => m.role === "professor").length === 0 ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Nenhum professor cadastrado ainda.
              </Text>
            </Card>
          ) : (
            <View className="mt-6 gap-3">
              {members
                .filter((m) => m.role === "professor")
                .map((member) => (
                  <Card key={member.userId} className="gap-2">
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-display text-base text-strong-light dark:text-strong-dark">
                          {member.fullName ?? member.email ?? "Professor"}
                        </Text>
                        {member.email ? (
                          <Text className="text-xs text-muted-light dark:text-muted-dark">
                            {member.email}
                          </Text>
                        ) : null}
                      </View>
                      <Button
                        label="Remover"
                        variant="ghost"
                        size="sm"
                        disabled={isSaving}
                        onPress={() => handleRemove(member.userId)}
                      />
                    </View>
                  </Card>
                ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
