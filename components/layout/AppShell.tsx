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
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from "react-native-reanimated";
import { CalendarDays, Home, Menu, Moon, Settings2, Sun, UserCircle2 } from "lucide-react-native";

import { hapticLight } from "../../src/core/utils/haptics";
import { getIconColor } from "../../src/ui/theme/icon-colors";
import { useTheme } from "../../src/ui/theme/ThemeProvider";
import { OfflineIndicator } from "../ui/OfflineIndicator";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/home", icon: Home },
  { label: "Agenda", href: "/schedule", icon: CalendarDays },
  { label: "Perfil", href: "/profile", icon: UserCircle2 },
  { label: "Ajustes", href: "/settings", icon: Settings2 },
];

const DEFAULT_MOBILE_NAV_ITEMS = DEFAULT_NAV_ITEMS.filter((item) =>
  ["/home", "/schedule", "/profile"].includes(item.href)
);

type AppShellProps = {
  children: React.ReactNode;
  navItems?: NavItem[];
  mobileNavItems?: NavItem[];
  headerSubtitle?: string;
};

export function AppShell({
  children,
  navItems,
  mobileNavItems,
  headerSubtitle,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const resolvedNavItems = navItems ?? DEFAULT_NAV_ITEMS;
  const resolvedMobileItems = mobileNavItems ?? DEFAULT_MOBILE_NAV_ITEMS;
  const subtitle = headerSubtitle ?? "Portal do aluno";

  const activeHref = useMemo(() => {
    if (!pathname) return "/home";
    const match = resolvedNavItems.find((item) => pathname.startsWith(item.href));
    return match?.href ?? "/home";
  }, [pathname, resolvedNavItems]);

  const handleNavPress = (href: string, onNavigate?: () => void) => {
    void hapticLight();
    router.replace(href);
    onNavigate?.();
  };

  const renderNavItems = (onNavigate?: () => void) =>
    resolvedNavItems.map((item) => {
      const isActive = activeHref === item.href;
      const Icon = item.icon;
      const iconColor = getIconColor(theme, isActive ? "active" : "inactive");

      return (
        <Pressable
          key={item.href}
          accessibilityRole="button"
          onPress={() => handleNavPress(item.href, onNavigate)}
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
              BlackBelt
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
                  accessibilityLabel="Abrir menu"
                  onPress={() => {
                    void hapticLight();
                    setDrawerOpen(true);
                  }}
                  className="rounded-full border border-subtle-light bg-surface-light p-2 dark:border-subtle-dark dark:bg-surface-dark"
                  style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
                >
                  <Menu size={18} color={getIconColor(theme, "header")} />
                </Pressable>
              ) : null}
              <View>
                <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                  BlackBelt
                </Text>
                <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
                  {subtitle}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Alternar tema"
              onPress={() => {
                void hapticLight();
                void toggle();
              }}
              className="flex-row items-center gap-2 rounded-full border border-subtle-light bg-surface-light px-3 py-2 dark:border-subtle-dark dark:bg-surface-dark"
              style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
            >
              {theme === "dark" ? (
                <Sun size={16} color={getIconColor(theme, "header")} />
              ) : (
                <Moon size={16} color={getIconColor(theme, "header")} />
              )}
              <Text className="text-xs text-muted-light dark:text-muted-dark">
                {theme === "dark" ? "Escuro" : "Claro"}
              </Text>
            </Pressable>
          </View>

          <OfflineIndicator />
          <View className="flex-1" style={!isDesktop ? { paddingBottom: 72 } : undefined}>
            {children}
          </View>
        </View>
      </View>

      {!isDesktop ? (
        <View className="min-h-[52px] border-t border-subtle-light bg-surface-light px-2 pb-2 pt-2 dark:border-subtle-dark dark:bg-surface-dark">
          <View className="flex-row">
            {resolvedMobileItems.map((item) => {
              const isActive = activeHref === item.href;
              const Icon = item.icon;
              const iconColor = getIconColor(theme, isActive ? "active" : "inactive");
              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="button"
                  onPress={() => handleNavPress(item.href)}
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
                  {isActive && (
                    <View className="mt-0.5 h-1 w-4 rounded-full bg-brand-600" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Modal transparent visible={drawerOpen} animationType="none" onRequestClose={() => setDrawerOpen(false)}>
        <View className="flex-1">
          <Pressable
            className="absolute inset-0"
            onPress={() => setDrawerOpen(false)}
          >
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              className="flex-1 bg-black/40"
            />
          </Pressable>
          <Animated.View
            entering={SlideInLeft.duration(250).springify()}
            exiting={SlideOutLeft.duration(200)}
            className="h-full w-72 bg-surface-light px-6 py-8 dark:bg-surface-dark"
          >
            <Text className="font-display text-lg text-strong-light dark:text-strong-dark">
              BlackBelt
            </Text>
            <View className="mt-6 gap-2">{renderNavItems(() => setDrawerOpen(false))}</View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
