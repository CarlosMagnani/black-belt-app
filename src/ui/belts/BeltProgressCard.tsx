import React from "react";
import { Text } from "react-native";

import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";

type BeltProgressCardProps = {
  title: string;
  value: string;
  helper?: string;
  progress?: number;
  className?: string;
};

export function BeltProgressCard({
  title,
  value,
  helper,
  progress = 0,
  className,
}: BeltProgressCardProps) {
  return (
    <Card className={["gap-2", className ?? ""].join(" ")}>
      <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
        {title}
      </Text>
      <Text className="font-display text-2xl text-strong-light dark:text-strong-dark">
        {value}
      </Text>
      {helper ? (
        <Text className="text-xs text-muted-light dark:text-muted-dark">{helper}</Text>
      ) : null}
      <ProgressBar value={progress} className="mt-2" />
    </Card>
  );
}
