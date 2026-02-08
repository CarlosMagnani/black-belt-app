import React from "react";
import { Slot } from "expo-router";
import { ClipboardCheck } from "lucide-react-native";

import { AppShell } from "../../components/layout/AppShell";

const PROFESSOR_NAV_ITEMS = [{ label: "Check-ins", href: "/professor-checkins", icon: ClipboardCheck }];

export default function ProfessorLayout() {
  return (
    <AppShell navItems={PROFESSOR_NAV_ITEMS} mobileNavItems={PROFESSOR_NAV_ITEMS} headerSubtitle="Portal do professor">
      <Slot />
    </AppShell>
  );
}

