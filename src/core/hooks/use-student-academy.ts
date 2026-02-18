import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";

import type { Academy, AcademyMember } from "../ports/blackbelt-ports";
import { useAuthProfile } from "./use-auth-profile";
import { blackBeltAdapters } from "../../infra/supabase/adapters";

type StudentAcademyState = {
  isBooting: boolean;
  session: ReturnType<typeof useAuthProfile>["session"];
  profile: ReturnType<typeof useAuthProfile>["profile"];
  role: ReturnType<typeof useAuthProfile>["role"];
  membership: AcademyMember | null;
  academy: Academy | null;
  academyId: string | null;
  isAcademyLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

export const useStudentAcademy = (): StudentAcademyState => {
  const router = useRouter();
  const {
    isLoading: isBooting,
    session,
    profile,
    role,
    membership: authMembership,
    refresh: refreshProfile,
  } = useAuthProfile();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [isAcademyLoading, setIsAcademyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isBooting) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    if (role && role !== "student") {
      router.replace("/");
    }
  }, [isBooting, session, profile, role, router]);

  useEffect(() => {
    if (!profile?.id) return;
    if (role !== "student" && role !== null) return;

    let isActive = true;

    const loadAcademy = async () => {
      setIsAcademyLoading(true);
      setError(null);
      try {
        const memberships = await blackBeltAdapters.memberships.listByUser(profile.id);
        if (!isActive) return;
        if (memberships.length === 0) {
          router.replace("/join-academy");
          return;
        }
        const mem = memberships[0];
        setAcademyId(mem.academyId);
        const academyData = await blackBeltAdapters.academies.getById(mem.academyId);
        if (!isActive) return;
        setAcademy(academyData);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar a academia.");
      } finally {
        if (isActive) setIsAcademyLoading(false);
      }
    };

    void loadAcademy();

    return () => {
      isActive = false;
    };
  }, [profile?.id, role, router]);

  return {
    isBooting,
    session,
    profile,
    role,
    membership: authMembership,
    academy,
    academyId,
    isAcademyLoading,
    error,
    refreshProfile,
  };
};
