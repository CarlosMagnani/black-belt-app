import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";

import type { Academy } from "../ports/blackbelt-ports";
import { useAuthProfile } from "./use-auth-profile";
import { blackBeltAdapters } from "../../infra/supabase/adapters";

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
  const [hasNoAcademy, setHasNoAcademy] = useState(false);

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
    if (profile.role !== "owner") {
      router.replace("/");
      return;
    }
    if (hasNoAcademy) {
      router.replace("/create-academy");
    }
  }, [isBooting, session, profile, router, hasNoAcademy]);

  const refresh = useCallback(async () => {
    if (!profile?.id || profile.role !== "owner") return;
    setIsLoading(true);
    setError(null);
    try {
      const academyData = await blackBeltAdapters.academies.getByOwnerId(profile.id);
      if (!academyData) {
        setHasNoAcademy(true);
        return;
      }
      setHasNoAcademy(false);
      setAcademy(academyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, profile?.role]);

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
