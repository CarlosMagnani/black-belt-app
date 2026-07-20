// Value is User.id (ClassSchedule.instructorId FK), not AcademyMember.id.
import { beltColor, beltTextColor } from '../utils/beltColor'
import { getInitials } from '../utils/initials'
import type { MemberSummary } from '../features/schedule/schedule.types'

type ProfessorSelectProps = {
  value: string | null
  onChange: (value: string) => void
  academyMembers: MemberSummary[]
  name?: string
  error?: string
}

export function ProfessorSelect({
  value,
  onChange,
  academyMembers,
  name,
  error,
}: ProfessorSelectProps) {
  const eligible = academyMembers
    .filter((member) => member.role === 'owner' || member.role === 'professor')
    .sort((a, b) => a.fullName.localeCompare(b.fullName))

  const selected = eligible.find((member) => member.userId === value) ?? null

  return (
    <div>
      <div className="flex items-center gap-3">
        {selected ? (
          <MemberAvatar member={selected} />
        ) : (
          <div className="w-[38px] h-[38px] bg-surface-2 flex items-center justify-center text-muted-2 font-display text-[12px]">
            —
          </div>
        )}
        <select
          name={name}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className="h-[56px] flex-1 bg-surface border border-line px-4 text-[17px] text-text outline-none focus:border-red"
        >
          <option value="" disabled>
            Selecione um professor
          </option>
          {eligible.map((member) => (
            <option key={member.id} value={member.userId}>
              Prof. {member.fullName}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-2 text-[12px] text-red">{error}</p>}
    </div>
  )
}

function MemberAvatar({ member }: { member: MemberSummary }) {
  if (member.avatarUrl) {
    return (
      <img
        alt={member.fullName}
        src={member.avatarUrl}
        className="w-[38px] h-[38px] object-cover"
      />
    )
  }

  const belt = member.currentBelt?.belt
  const background = belt ? beltColor(belt) : '#1C1C1E'
  const color = belt ? beltTextColor(belt) : '#F5F5F5'

  return (
    <div
      className="w-[38px] h-[38px] flex items-center justify-center font-display text-[12px]"
      style={{ backgroundColor: background, color: color }}
    >
      {getInitials(member.fullName)}
    </div>
  )
}
