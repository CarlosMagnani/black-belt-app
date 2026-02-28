import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { CheckinApprovalCard } from "../../components/owner/CheckinApprovalCard";
import { Card } from "../../components/ui/Card";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { Skeleton } from "../../components/ui/Skeleton";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import type { CheckinListItem } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { showToast } from "../../src/core/utils/toast";
import { hapticSuccess, hapticError } from "../../src/core/utils/haptics";

function OwnerCheckinsScreen() {
  const { academy, profileId, isLoading, error, refresh: refreshAcademy } = useOwnerAcademy();
  const [pending, setPending] = useState<CheckinListItem[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = useCallback(async (academyId: string) => {
    setIsListLoading(true);
    try {
      const list = await blackBeltAdapters.checkins.listPendingByAcademy(academyId);
      setPending(list);
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Nao foi possivel carregar check-ins.",
        variant: "error",
      });
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    void loadPending(academy.id).then(() => {
      if (!isActive) return;
    });

    return () => {
      isActive = false;
    };
  }, [academy, loadPending]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAcademy();
      if (academy) await loadPending(academy.id);
    } finally {
      setIsRefreshing(false);
    }
  }, [academy, loadPending, refreshAcademy]);

  const handleStatus = async (item: CheckinListItem, status: "approved" | "rejected") => {
    if (!profileId) return;
    setProcessingId(item.id);
    try {
      await blackBeltAdapters.checkins.updateStatus({
        id: item.id,
        status,
        validatedBy: profileId,
      });
      setPending((prev) => prev.filter((entry) => entry.id !== item.id));
      if (status === "approved") {
        void hapticSuccess();
      } else {
        void hapticError();
      }
      showToast({
        message: status === "approved" ? "Check-in aprovado." : "Check-in rejeitado.",
        variant: status === "approved" ? "success" : "info",
      });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Nao foi possivel atualizar o check-in.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void handleRefresh()} />
      }
    >
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Check-ins
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Validacao pendente
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Aprove ou rejeite check-ins de alunos.
          </Text>

          {error ? (
            <Card className="mt-6" variant="outline">
              <Text className="text-sm text-red-500">{error}</Text>
            </Card>
          ) : null}

          {isLoading || isListLoading ? (
            <View className="mt-6 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <View className="flex-row items-center gap-3">
                    <Skeleton width={44} height={44} borderRadius={22} />
                    <View className="flex-1 gap-2">
                      <Skeleton height={16} width="60%" />
                      <Skeleton height={12} width="40%" />
                    </View>
                  </View>
                  <View className="mt-3 flex-row gap-2">
                    <Skeleton height={36} width="48%" borderRadius={8} />
                    <Skeleton height={36} width="48%" borderRadius={8} />
                  </View>
                </Card>
              ))}
            </View>
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

export default function OwnerCheckins() {
  return (
    <ErrorBoundary>
      <OwnerCheckinsScreen />
    </ErrorBoundary>
  );
}
