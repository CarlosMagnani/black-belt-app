import React from "react";
import { Text, View } from "react-native";

import { Card } from "../ui/Card";

type KpiCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  className?: string;
};

export function KpiCard({ label, value, helper, className }: KpiCardProps) {
  return (
    <Card className={["gap-2", className ?? ""].join(" ")}> 
      <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
        {label}
      </Text>
      <Text className="font-display text-3xl text-strong-light dark:text-strong-dark">
        {value}
      </Text>
      {helper ? (
        <Text className="text-xs text-muted-light dark:text-muted-dark">{helper}</Text>
      ) : null}
    </Card>
  );
}
