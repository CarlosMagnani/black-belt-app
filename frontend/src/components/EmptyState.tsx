import { Card } from './Card'

export function EmptyState({
  message,
  action,
  variant = 'solid',
}: {
  message: string
  action?: { label: string; onClick: () => void }
  variant?: 'solid' | 'dashed'
}) {
  return (
    <Card className={variant === 'dashed' ? 'border-dashed border-line-2 p-6' : 'p-6'}>
      <div className="text-center">
        <p className="text-[14px] text-muted-2">{message}</p>
        {action && (
          <button
            className="mt-4 text-[13px] text-red font-mono uppercase tracking-[0.12em]"
            onClick={action.onClick}
            type="button"
          >
            {action.label}
          </button>
        )}
      </div>
    </Card>
  )
}
