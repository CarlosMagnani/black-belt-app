import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

type UserProfile = {
  id: string
  email: string
  fullName: string
  onboardingRole: 'owner' | 'student' | null
}

type AuthContextValue = {
  session: Session | null
  user: UserProfile | null
  onboardingRole: 'owner' | 'student' | null
  isLoading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export type { UserProfile }
