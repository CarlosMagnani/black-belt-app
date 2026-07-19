import { Card } from './Card'
import { PrimaryButton } from './PrimaryButton'

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="p-6 text-center">
      <p className="font-display text-[16px] uppercase mb-2">ALGO SAIU DO EIXO</p>
      <p className="text-[14px] text-muted-2 mb-6">{message}</p>
      <PrimaryButton fullWidth onClick={onRetry}>
        TENTAR NOVAMENTE
      </PrimaryButton>
    </Card>
  )
}
