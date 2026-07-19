import { supabase } from '../lib/supabase'

export type ApiError = {
  code: string
  message: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: ApiError | null }> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  return response.json()
}
