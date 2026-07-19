import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../../components/ConfirmModal'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { GhostButton } from '../../components/GhostButton'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'
import { PlusIcon } from '../../components/Icons'
import { PrimaryButton } from '../../components/PrimaryButton'
import { WeeklyScheduleGrid } from '../../components/WeeklyScheduleGrid'
import { useAuth } from '../../hooks/useAuth'
import { useClasses } from '../../hooks/useClasses'
import { useDeactivateClass } from '../../hooks/useDeactivateClass'
import type { ScheduledClass } from '../../features/schedule/schedule.types'

export function AgendaPage() {
  const navigate = useNavigate()
  const { onboardingRole } = useAuth()
  const isOwner = onboardingRole === 'owner'
  const [showInactive, setShowInactive] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<ScheduledClass | null>(null)

  const { classes, isLoading, isError, error, refetch } = useClasses(showInactive)
  const deactivate = useDeactivateClass()

  function handleAddClass() {
    navigate('/mestre/agenda/nova')
  }

  function handleEditClass(cls: ScheduledClass) {
    navigate(`/mestre/agenda/${cls.id}/editar`)
  }

  function handleDeactivateClass(cls: ScheduledClass) {
    setDeactivateTarget(cls)
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return
    deactivate.mutate(deactivateTarget.id, {
      onSuccess: () => setDeactivateTarget(null),
      onError: () => setDeactivateTarget(null),
    })
  }

  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">AGENDA</p>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
            AULAS DA SEMANA
          </h2>
          {isOwner && (
            <PrimaryButton
              className="h-11 min-h-0 px-3 text-[13px] flex items-center gap-2 shrink-0"
              onClick={handleAddClass}
            >
              <PlusIcon className="w-[16px] h-[16px]" />
              <span>NOVA AULA</span>
            </PrimaryButton>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-end">
          <GhostButton
            className="h-9 min-h-0 px-3 text-[12px]"
            onClick={() => setShowInactive((current) => !current)}
          >
            {showInactive ? 'SOMENTE ATIVAS' : 'MOSTRAR INATIVAS'}
          </GhostButton>
        </div>
      )}

      {isLoading && <LoadingSkeleton rows={4} />}

      {isError && (
        <ErrorState
          message={error?.message ?? 'Não foi possível carregar a agenda.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && classes.length === 0 && (
        <EmptyState
          message="Nenhuma aula recorrente cadastrada."
          action={isOwner ? { label: 'CRIAR PRIMEIRA AULA', onClick: handleAddClass } : undefined}
        />
      )}

      {!isLoading && !isError && classes.length > 0 && (
        <WeeklyScheduleGrid
          classes={classes}
          isOwner={isOwner}
          onEditClass={handleEditClass}
          onDeactivateClass={handleDeactivateClass}
          onAddClass={handleAddClass}
        />
      )}

      <ConfirmModal
        open={deactivateTarget !== null}
        title="Desativar aula?"
        message="Aula será desativada. Alunos não conseguirão fazer check-in. Histórico de chamadas é preservado."
        confirmLabel="DESATIVAR"
        confirmVariant="danger"
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
        isLoading={deactivate.isPending}
      />
    </section>
  )
}
