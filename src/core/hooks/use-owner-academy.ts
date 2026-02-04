import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";

import type { Academy } from "../ports/dojoflow-ports";
import { useAuthProfile } from "./use-auth-profile";
import { dojoFlowAdapters } from "../../infra/supabase/adapters";

type OwnerAcademyState = {
  isLoading: boolean;
  profileId: string | null;
  academy: Academy | null;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useOwnerAcademy = (): OwnerAcademyState => {
  const router = useRouter();
  const { isLoading: isBooting, session, profile } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isBooting) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!profile?.role) {
      router.replace("/onboarding");
      return;
    }
    if (profile.role !== "professor") {
      router.replace("/home");
    }
  }, [isBooting, session, profile, router]);

  const refresh = useCallback(async () => {
    if (!profile?.id || profile.role !== "professor") return;
    setIsLoading(true);
    setError(null);
    try {
      const academyData = await dojoFlowAdapters.academies.getByOwnerId(profile.id);
      if (!academyData) {
        router.replace("/create-academy");
        return;
      }
      setAcademy(academyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, profile?.role, router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    isLoading: isBooting || isLoading,
    profileId: profile?.id ?? null,
    academy,
    error,
    refresh,
  };
};
