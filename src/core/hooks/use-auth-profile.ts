import { useCallback, useEffect, useState } from "react";

import type { AuthSession, Profile, AcademyMember, MemberRole } from "../ports/blackbelt-ports";
import { blackBeltAdapters } from "../../infra/supabase/adapters";

type AuthProfileState = {
  isLoading: boolean;
  session: AuthSession | null;
  profile: Profile | null;
  /** Resolved from ownership, membership, then auth metadata fallback. */
  role: MemberRole | null;
  membership: AcademyMember | null;
  error: string | null;
  refresh: () => Promise<void>;
};

const toMemberRole = (value: unknown): MemberRole | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "owner" || normalized === "student" || normalized === "instructor") {
    return normalized;
  }
  if (normalized === "professor") {
    return "instructor";
  }
  return null;
};

export const useAuthProfile = (): AuthProfileState => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<MemberRole | null>(null);
  const [membership, setMembership] = useState<AcademyMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentSession = await blackBeltAdapters.auth.getSession();
      setSession(currentSession);
      if (!currentSession) {
        setProfile(null);
        setRole(null);
        setMembership(null);
        return;
      }

      const userId = currentSession.user.id;
      const currentProfile = await blackBeltAdapters.profiles.getProfile(userId);
      setProfile(currentProfile);

      // Check if user owns an academy
      const ownedAcademy = await blackBeltAdapters.academies.getByOwnerId(userId);
      if (ownedAcademy) {
        setRole("owner");
        // Try to get the owner's membership record
        const mem = await blackBeltAdapters.memberships.getMember(ownedAcademy.id, userId);
        setMembership(mem);
        return;
      }

      // Otherwise check memberships
      const memberships = await blackBeltAdapters.memberships.listByUser(userId);
      if (memberships.length > 0) {
        setMembership(memberships[0]);
        setRole(toMemberRole(memberships[0].role));
      } else {
        const currentUser = await blackBeltAdapters.auth.getCurrentUser();
        const metadata = currentUser?.metadata;
        const metadataRole =
          toMemberRole(metadata?.onboarding_role) ?? toMemberRole(metadata?.role);
        setRole(metadataRole);
        setMembership(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar a sessao.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const { unsubscribe } = blackBeltAdapters.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
        setRole(null);
        setMembership(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void refresh();
      }
    });
    return () => unsubscribe();
  }, [refresh]);

  return { isLoading, session, profile, role, membership, error, refresh };
};
