import { useState } from 'react'
import { Card } from '../../components/Card'
import { ConfirmModal } from '../../components/ConfirmModal'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'
import { PrimaryButton } from '../../components/PrimaryButton'
import { GhostButton } from '../../components/GhostButton'
import { BeltSwatch } from '../../components/BeltSwatch'
import { RoleBadge } from '../../components/RoleBadge'
import { useToast } from '../../hooks/useToast'
import { usePromoteToProfessor } from '../../hooks/usePromoteToProfessor'
import { useRevokeProfessor } from '../../hooks/useRevokeProfessor'
import { useRoster } from '../../hooks/useRoster'
import { beltColor, beltTextColor, formatBeltLabel } from '../../utils/beltColor'
import { getInitials } from '../../utils/initials'
import type { MemberSummary } from './roster.types'
import type { ApiError } from '../../lib/api'

export function RosterPage() {
  const { members, isLoading, isError, error, refetch } = useRoster()
  const promote = usePromoteToProfessor()
  const revoke = useRevokeProfessor()
  const { showToast } = useToast()
  const [promoteTarget, setPromoteTarget] = useState<MemberSummary | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<MemberSummary | null>(null)
  const [blockedRevokeIds, setBlockedRevokeIds] = useState<Set<string>>(new Set())

  if (isLoading) {
    return (
      <section className="page-enter space-y-6">
        <RosterSection title="DONOS" count={0} loading />
        <RosterSection title="PROFESSORES" count={0} loading />
        <RosterSection title="ALUNOS" count={0} loading />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="page-enter pt-4">
        <ErrorState
          message={error?.message ?? 'Não foi possível carregar a equipe.'}
          onRetry={refetch}
        />
      </section>
    )
  }

  const owners = members.filter((member) => member.role === 'owner')
  const professors = members.filter((member) => member.role === 'professor')
  const students = members.filter((member) => member.role === 'student')

  function isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as ApiError).code === 'string'
    )
  }

  function handlePromote(member: MemberSummary) {
    setPromoteTarget(member)
  }

  function confirmPromote() {
    if (!promoteTarget) return
    promote.mutate(promoteTarget.id, {
      onSuccess: () => {
        setPromoteTarget(null)
      },
      onError: (error) => {
        setPromoteTarget(null)
        const message = isApiError(error) ? error.message : 'Não foi possível promover.'
        showToast({ type: 'error', message })
      },
    })
  }

  function handleRevoke(member: MemberSummary) {
    setRevokeTarget(member)
  }

  function confirmRevoke() {
    if (!revokeTarget) return
    revoke.mutate(revokeTarget.id, {
      onSuccess: () => {
        setRevokeTarget(null)
      },
      onError: (error) => {
        setRevokeTarget(null)
        if (isApiError(error) && error.code === 'professor_teaches_active_class') {
          setBlockedRevokeIds((current) => new Set(current).add(revokeTarget.id))
        }
        const message = isApiError(error) ? error.message : 'Não foi possível revogar.'
        showToast({ type: 'error', message })
      },
    })
  }

  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">EQUIPE</p>
        <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
          {members.length} MEMBRO{members.length === 1 ? '' : 'S'}
        </h2>
      </div>

      <RosterSection title="DONOS" count={owners.length}>
        {owners.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
        {owners.length === 0 && <EmptyState message="Você é o único dono." variant="dashed" />}
      </RosterSection>

      <RosterSection title="PROFESSORES" count={professors.length}>
        {professors.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            action={
              <GhostButton
                className="h-11 min-h-0 px-3 text-[13px]"
                disabled={blockedRevokeIds.has(member.id)}
                onClick={() => handleRevoke(member)}
                title={
                  blockedRevokeIds.has(member.id)
                    ? 'Professor ministra aula ativa'
                    : 'Revogar professor'
                }
              >
                REVOGAR
              </GhostButton>
            }
          />
        ))}
        {professors.length === 0 && (
          <EmptyState message="Sem professores. Promova um aluno para começar." variant="dashed" />
        )}
      </RosterSection>

      <RosterSection title="ALUNOS" count={students.length}>
        {students.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            action={
              <PrimaryButton
                className="h-11 min-h-0 px-3 text-[13px]"
                onClick={() => handlePromote(member)}
              >
                PROMOVER
              </PrimaryButton>
            }
          />
        ))}
        {students.length === 0 && (
          <EmptyState message="Sem alunos ainda. Compartilhe o convite da academia." variant="dashed" />
        )}
      </RosterSection>

      <ConfirmModal
        open={promoteTarget !== null}
        title={`Promover ${promoteTarget?.fullName} a Professor?`}
        message="O aluno passará a ter permissões de professor na academia."
        confirmLabel="CONFIRMAR"
        confirmVariant="primary"
        onConfirm={confirmPromote}
        onCancel={() => setPromoteTarget(null)}
        isLoading={promote.isPending}
      />

      <ConfirmModal
        open={revokeTarget !== null}
        title={`Revogar professor de ${revokeTarget?.fullName}?`}
        message="O professor voltará ao papel de aluno. Esta ação não pode ser desfeita."
        confirmLabel="REVOGAR"
        confirmVariant="danger"
        onConfirm={confirmRevoke}
        onCancel={() => setRevokeTarget(null)}
        isLoading={revoke.isPending}
      />
    </section>
  )
}

function RosterSection({
  children,
  count,
  loading,
  title,
}: {
  children?: React.ReactNode
  count: number
  loading?: boolean
  title: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">{title}</p>
          <p className="font-display text-[18px] uppercase tracking-[-0.01em] leading-[0.95]">
            {loading ? '-' : count} {count === 1 ? 'MEMBRO' : 'MEMBROS'}
          </p>
        </div>
      </div>
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  )
}

function MemberRow({
  member,
  action,
}: {
  member: MemberSummary
  action?: React.ReactNode
}) {
  const initials = getInitials(member.fullName)
  const beltColorValue = member.currentBelt ? beltColor(member.currentBelt.belt) : undefined
  const beltText = member.currentBelt ? beltTextColor(member.currentBelt.belt) : '#F5F5F5'

  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="shrink-0">
        {member.avatarUrl ? (
          <img
            alt={member.fullName}
            className="w-[38px] h-[38px] object-cover"
            src={member.avatarUrl}
          />
        ) : (
          <div
            className="w-[38px] h-[38px] flex items-center justify-center font-display text-[12px]"
            style={{
              backgroundColor: beltColorValue ?? '#1C1C1E',
              color: beltColorValue ? beltText : '#F5F5F5',
            }}
          >
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-[15px] uppercase tracking-[-0.01em] leading-tight">
            {member.fullName}
          </span>
          <RoleBadge role={member.role} />
        </div>
        {member.nickname && <p className="text-[12px] text-muted-2">{member.nickname}</p>}
        {member.role === 'student' && member.currentBelt && (
          <div className="flex items-center gap-2 mt-1">
            <BeltSwatch belt={member.currentBelt.belt} />
            <span className="text-[12px] text-muted-2">
              {formatBeltLabel(member.currentBelt.belt, member.currentBelt.degree)}
            </span>
          </div>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </Card>
  )
}
