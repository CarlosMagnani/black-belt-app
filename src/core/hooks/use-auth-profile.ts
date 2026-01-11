import { useCallback, useEffect, useState } from "react";

import type { AuthSession, Profile } from "../ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../infra/supabase/adapters";

type AuthProfileState = {
  isLoading: boolean;
  session: AuthSession | null;
  profile: Profile | null;
  error: string | null;
  refresh: () => Promise<void>;
};

export const useAuthProfile = (): AuthProfileState => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentSession = await dojoFlowAdapters.auth.getSession();
      setSession(currentSession);
      if (!currentSession) {
        setProfile(null);
        return;
      }
      const currentProfile = await dojoFlowAdapters.profiles.getProfile(currentSession.user.id);
      setProfile(currentProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar a sessao.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { isLoading, session, profile, error, refresh };
};
