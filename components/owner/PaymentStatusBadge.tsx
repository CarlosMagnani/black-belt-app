import React from "react";
import { Text, View } from "react-native";

export type PaymentStatus = "paid" | "due_soon" | "overdue" | "no_subscription";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  className?: string;
};

const STATUS_CONFIG: Record<
  PaymentStatus,
  { bg: string; text: string; label: string; icon: string }
> = {
  paid: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    label: "Em dia",
    icon: "✓",
  },
  due_soon: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    label: "Vence em breve",
    icon: "⏰",
  },
  overdue: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    label: "Atrasado",
    icon: "!",
  },
  no_subscription: {
    bg: "bg-gray-100 dark:bg-gray-800/50",
    text: "text-gray-800 dark:text-gray-400",
    label: "Sem plano",
    icon: "−",
  },
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      className={[
        "flex-row items-center gap-1 rounded-full px-2 py-1",
        config.bg,
        className ?? "",
      ].join(" ")}
    >
      <Text className={["text-xs font-medium", config.text].join(" ")}>
        {config.icon} {config.label}
      </Text>
    </View>
  );
}

/**
 * Determines payment status based on subscription data.
 * @param subscription - Subscription object with status and next_billing_at
 * @returns PaymentStatus
 */
export function getPaymentStatus(
  subscription?: { status?: string; next_billing_at?: string | null } | null
): PaymentStatus {
  if (!subscription || !subscription.status) {
    return "no_subscription";
  }

  if (subscription.status === "overdue" || subscription.status === "cancelled") {
    return "overdue";
  }

  if (subscription.status === "active" && subscription.next_billing_at) {
    const nextBilling = new Date(subscription.next_billing_at);
    const now = new Date();
    const daysUntilBilling = Math.ceil(
      (nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilBilling <= 0) {
      return "overdue";
    }
    if (daysUntilBilling <= 3) {
      return "due_soon";
    }
    return "paid";
  }

  if (subscription.status === "active") {
    return "paid";
  }

  return "no_subscription";
}
