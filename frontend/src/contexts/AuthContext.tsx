import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './auth.context'
import { apiClient } from '../lib/api'
import { supabase } from '../lib/supabase'
import type { UserProfile } from './auth.context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setUser(null)
      return
    }

    const result = await apiClient<{ user: UserProfile }>('/auth/me')
    if (result.data) {
      setUser(result.data.user)
    } else {
      setUser(null)
      if (result.error) {
        console.error(result.error)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      loadUser(data.session).finally(() => {
        if (isMounted) setIsLoading(false)
      })
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadUser(nextSession).finally(() => {
        if (isMounted) setIsLoading(false)
      })
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [loadUser])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await loadUser(session)
    setIsLoading(false)
  }, [loadUser, session])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        onboardingRole: user?.onboardingRole ?? null,
        isLoading,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export type { UserProfile } from './auth.context'
