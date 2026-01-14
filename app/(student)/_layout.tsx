import React from "react";
import { Slot } from "expo-router";

import { AppShell } from "../../components/layout/AppShell";

export default function StudentLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
