import { useEffect, useRef } from 'react'
import { Card } from './Card'
import { GhostButton } from './GhostButton'
import { PrimaryButton } from './PrimaryButton'

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  isLoading,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  confirmVariant: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    confirmRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      role="presentation"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-[360px] p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p
          id="confirm-title"
          className="font-display text-[18px] uppercase tracking-[-0.01em] leading-[0.95] mb-2"
        >
          {title}
        </p>
        <p className="text-[13px] text-muted-2 mb-6">{message}</p>
        <div className="flex flex-col gap-3">
          <GhostButton fullWidth onClick={onCancel} disabled={isLoading}>
            CANCELAR
          </GhostButton>
          {confirmVariant === 'primary' ? (
            <PrimaryButton
              ref={confirmRef}
              fullWidth
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'PROCESSANDO...' : confirmLabel}
            </PrimaryButton>
          ) : (
            <button
              ref={confirmRef}
              className="min-h-[50px] w-full bg-transparent text-red uppercase font-display text-[15px] tracking-[0.01em] px-4 transition disabled:opacity-40"
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? 'PROCESSANDO...' : confirmLabel}
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
