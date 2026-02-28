import React from "react";
import { Text, View } from "react-native";

type OverdueCounterProps = {
  count: number;
  className?: string;
};

export function OverdueCounter({ count, className }: OverdueCounterProps) {
  if (count === 0) {
    return (
      <View
        className={[
          "flex-row items-center gap-2 rounded-lg bg-green-100 px-3 py-2 dark:bg-green-900/30",
          className ?? "",
        ].join(" ")}
      >
        <Text className="text-lg">✓</Text>
        <Text className="text-sm font-medium text-green-800 dark:text-green-400">
          Todos em dia
        </Text>
      </View>
    );
  }

  return (
    <View
      className={[
        "flex-row items-center gap-2 rounded-lg bg-red-100 px-3 py-2 dark:bg-red-900/30",
        className ?? "",
      ].join(" ")}
    >
      <View className="h-6 w-6 items-center justify-center rounded-full bg-red-500">
        <Text className="text-xs font-bold text-white">{count > 99 ? "99+" : count}</Text>
      </View>
      <Text className="text-sm font-medium text-red-800 dark:text-red-400">
        {count === 1 ? "1 inadimplente" : `${count} inadimplentes`}
      </Text>
    </View>
  );
}
