import { createContext } from 'react'

type ToastType = 'success' | 'error'

type Toast = {
  id: string
  type: ToastType
  message: string
}

type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)
