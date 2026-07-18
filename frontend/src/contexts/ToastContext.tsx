import { useState, useCallback, type ReactNode } from 'react'
import { ToastContext } from './toast.context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error'; message: string }[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: { type: 'success' | 'error'; message: string }) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, ...toast }])

    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 left-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto border p-4 font-mono text-[12px] uppercase tracking-[0.12em] ${
              toast.type === 'success'
                ? 'border-red bg-red text-bg'
                : 'border-red bg-surface text-red'
            }`}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
