import React from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";

import type { Belt } from "../../src/core/ports/blackbelt-ports";
import { Card } from "../ui/Card";
import { PaymentStatusBadge, type PaymentStatus } from "./PaymentStatusBadge";

export type StudentWithPayment = {
  userId: string;
  fullName: string | null;
  email: string | null;
  currentBelt: Belt | null;
  avatarUrl: string | null;
  joinedAt: string | null;
  paymentStatus: PaymentStatus;
  planName?: string | null;
  nextBillingAt?: string | null;
};

type StudentListItemProps = {
  student: StudentWithPayment;
  onPress?: () => void;
  className?: string;
};

const getInitials = (value?: string | null): string => {
  if (!value) return "A";
  const parts = value.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
};

export function StudentListItem({ student, onPress, className }: StudentListItemProps) {
  const { width } = useWindowDimensions();
  const stackStatus = width < 560;

  const name = student.fullName || student.email || "Aluno";
  const initials = getInitials(student.fullName);
  const belt = student.currentBelt ?? "Branca";

  const content = (
    <Card className={["gap-3", className ?? ""].join(" ")}>
      <View className={stackStatus ? "gap-3" : "flex-row items-center gap-3"}>
        <View className="flex-row items-center gap-3 flex-1">
          {/* Avatar */}
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-subtle-light bg-app-light dark:border-subtle-dark dark:bg-app-dark">
            {student.avatarUrl ? (
              <Image
                source={{ uri: student.avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-sm text-muted-light dark:text-muted-dark">{initials}</Text>
            )}
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="font-display text-base text-strong-light dark:text-strong-dark">
              {name}
            </Text>
            <Text className="text-xs text-muted-light dark:text-muted-dark" numberOfLines={1}>
              Faixa {belt}
              {student.planName ? ` • ${student.planName}` : ""}
            </Text>
          </View>
        </View>

        {/* Payment Status */}
        <PaymentStatusBadge status={student.paymentStatus} className={stackStatus ? "self-start" : ""} />
      </View>

      {/* Additional info */}
      {student.nextBillingAt && student.paymentStatus !== "no_subscription" && (
        <Text className="text-xs text-muted-light dark:text-muted-dark">
          Próxima cobrança: {formatDate(student.nextBillingAt)}
        </Text>
      )}
    </Card>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
