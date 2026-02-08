import React from "react";
import { Slot } from "expo-router";
import { CalendarDays, CreditCard, Home, Settings2, Users2, ClipboardCheck } from "lucide-react-native";

import { AppShell } from "../../components/layout/AppShell";

const OWNER_NAV_ITEMS = [
  { label: "Dashboard", href: "/owner-home", icon: Home },
  { label: "Alunos", href: "/owner-students", icon: Users2 },
  { label: "Professores", href: "/owner-professors", icon: Users2 },
  { label: "Agenda", href: "/owner-schedule", icon: CalendarDays },
  { label: "Check-ins", href: "/owner-checkins", icon: ClipboardCheck },
  { label: "Academia", href: "/owner-settings", icon: Settings2 },
  { label: "Assinatura", href: "/owner-billing", icon: CreditCard },
];

const OWNER_MOBILE_ITEMS = [
  { label: "Dashboard", href: "/owner-home", icon: Home },
  { label: "Alunos", href: "/owner-students", icon: Users2 },
  { label: "Agenda", href: "/owner-schedule", icon: CalendarDays },
];

export default function OwnerLayout() {
  return (
    <AppShell
      navItems={OWNER_NAV_ITEMS}
      mobileNavItems={OWNER_MOBILE_ITEMS}
      headerSubtitle="Portal do dono"
    >
      <Slot />
    </AppShell>
  );
}
