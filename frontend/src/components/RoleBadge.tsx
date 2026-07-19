import type { MemberRole } from '../features/owner/roster.types'

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'DONO',
  professor: 'PROFESSOR',
  student: 'ALUNO',
}

export function RoleBadge({ role }: { role: MemberRole }) {
  const isOwner = role === 'owner'
  return (
    <span
      className={`inline-block font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-1 border ${
        isOwner ? 'border-red text-red' : 'border-line text-muted-2'
      }`}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}
