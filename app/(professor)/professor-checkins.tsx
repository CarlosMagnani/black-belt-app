import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { CheckinApprovalCard } from "../../components/owner/CheckinApprovalCard";
import { Card } from "../../components/ui/Card";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import type { CheckinListItem } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";

export default function ProfessorCheckins() {
  const router = useRouter();
  const { isLoading: isBooting, session, profile, role } = useAuthProfile();
  const [pending, setPending] = useState<CheckinListItem[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isBooting) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!role) {
      router.replace("/onboarding");
      return;
    }
    if (role !== "instructor") {
      router.replace("/");
    }
  }, [isBooting, session, role, router]);

  useEffect(() => {
    if (isBooting) return;
    if (!session) return;
    if (role !== "instructor") return;

    let isActive = true;

    const loadPending = async () => {
      setIsListLoading(true);
      setLocalError(null);
      try {
        const list = await blackBeltAdapters.checkins.listPendingMine();
        if (!isActive) return;
        setPending(list);
      } catch (err) {
        if (!isActive) return;
        setLocalError(err instanceof Error ? err.message : "Nao foi possivel carregar check-ins.");
      } finally {
        if (isActive) setIsListLoading(false);
      }
    };

    void loadPending();

    return () => {
      isActive = false;
    };
  }, [isBooting, role, session]);

  const handleStatus = async (item: CheckinListItem, status: "approved" | "rejected") => {
    if (!profile?.id) return;
    setProcessingId(item.id);
    setLocalError(null);
    try {
      await blackBeltAdapters.checkins.updateStatus({
        id: item.id,
        status,
        approvedByMemberId: profile.id,
      });
      setPending((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel atualizar o check-in.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Check-ins
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Validacao pendente
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Aprove ou rejeite check-ins das suas aulas.
          </Text>

          {localError ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{localError}</Text>
            </Card>
          ) : null}

          {isBooting || isListLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando check-ins...
              </Text>
            </Card>
          ) : pending.length === 0 ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Nenhum check-in pendente.
              </Text>
            </Card>
          ) : (
            <View className="mt-6 gap-4">
              {pending.map((item) => (
                <CheckinApprovalCard
                  key={item.id}
                  item={item}
                  isProcessing={processingId === item.id}
                  onApprove={() => handleStatus(item, "approved")}
                  onReject={() => handleStatus(item, "rejected")}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

