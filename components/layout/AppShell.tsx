import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { CalendarDays, Home, Menu, Moon, Settings2, Sun, UserCircle2 } from "lucide-react-native";

import { useTheme } from "../../src/ui/theme/ThemeProvider";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/home", icon: Home },
  { label: "Agenda", href: "/schedule", icon: CalendarDays },
  { label: "Perfil", href: "/profile", icon: UserCircle2 },
  { label: "Ajustes", href: "/settings", icon: Settings2 },
];

const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) =>
  ["/home", "/schedule", "/profile"].includes(item.href)
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const activeHref = useMemo(() => {
    if (!pathname) return "/home";
    const match = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
    return match?.href ?? "/home";
  }, [pathname]);

  const renderNavItems = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => {
      const isActive = activeHref === item.href;
      const Icon = item.icon;
      const iconColor = isActive ? (theme === "dark" ? "#EEF2FF" : "#1E3A8A") : "#94A3B8";

      return (
        <Pressable
          key={item.href}
          accessibilityRole="button"
          onPress={() => {
            router.replace(item.href);
            onNavigate?.();
          }}
          className={[
            "flex-row items-center gap-3 rounded-xl px-3 py-2",
            isActive ? "bg-brand-50 dark:bg-brand-600/20" : "bg-transparent",
          ].join(" ")}
          style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
        >
          <Icon size={18} color={iconColor} strokeWidth={2.2} />
          <Text
            className={[
              "text-sm font-body",
              isActive
                ? "text-brand-700 dark:text-brand-50"
                : "text-muted-light dark:text-muted-dark",
            ].join(" ")}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    });

  return (
    <SafeAreaView className="flex-1 bg-app-light dark:bg-app-dark">
      <View className="flex-1 web:flex-row">
        {isDesktop ? (
          <View className="w-64 border-r border-subtle-light bg-surface-light px-4 py-6 dark:border-subtle-dark dark:bg-surface-dark">
            <Text className="px-2 font-display text-lg text-strong-light dark:text-strong-dark">
              DojoFlow
            </Text>
            <View className="mt-6 gap-2">{renderNavItems()}</View>
          </View>
        ) : null}

        <View className="flex-1">
          <View className="flex-row items-center justify-between border-b border-subtle-light px-page py-4 dark:border-subtle-dark web:px-10">
            <View className="flex-row items-center gap-3">
              {!isDesktop ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setDrawerOpen(true)}
                  className="rounded-full border border-subtle-light bg-surface-light p-2 dark:border-subtle-dark dark:bg-surface-dark"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
                >
                  <Menu size={18} color={theme === "dark" ? "#E5E7EB" : "#0F172A"} />
                </Pressable>
              ) : null}
              <View>
                <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                  DojoFlow
                </Text>
                <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
                  Portal do aluno
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => void toggle()}
              className="flex-row items-center gap-2 rounded-full border border-subtle-light bg-surface-light px-3 py-2 dark:border-subtle-dark dark:bg-surface-dark"
              style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
            >
              {theme === "dark" ? (
                <Sun size={16} color="#E5E7EB" />
              ) : (
                <Moon size={16} color="#0F172A" />
              )}
              <Text className="text-xs text-muted-light dark:text-muted-dark">
                {theme === "dark" ? "Escuro" : "Claro"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-1" style={!isDesktop ? { paddingBottom: 72 } : undefined}>
            {children}
          </View>
        </View>
      </View>

      {!isDesktop ? (
        <View className="border-t border-subtle-light bg-surface-light px-2 pb-2 pt-2 dark:border-subtle-dark dark:bg-surface-dark">
          <View className="flex-row">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = activeHref === item.href;
              const Icon = item.icon;
              const iconColor = isActive ? (theme === "dark" ? "#EEF2FF" : "#1E3A8A") : "#94A3B8";
              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="button"
                  onPress={() => router.replace(item.href)}
                  className="flex-1 items-center justify-center gap-1 py-2"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
                >
                  <Icon size={18} color={iconColor} strokeWidth={2.2} />
                  <Text
                    className={[
                      "text-xs font-body",
                      isActive
                        ? "text-brand-700 dark:text-brand-50"
                        : "text-muted-light dark:text-muted-dark",
                    ].join(" ")}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Modal transparent visible={drawerOpen} animationType="slide" onRequestClose={() => setDrawerOpen(false)}>
        <View className="flex-1">
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={() => setDrawerOpen(false)}
          />
          <View className="h-full w-72 bg-surface-light px-6 py-8 dark:bg-surface-dark">
            <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
              DojoFlow
            </Text>
            <View className="mt-6 gap-2">{renderNavItems(() => setDrawerOpen(false))}</View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
