import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { formatClassDuration, formatClassLevel, formatScheduleTime } from '../../utils/scheduleFormat'
import type { ScheduledClass } from '../../features/schedule/schedule.types'
import type { CheckInRecord, CheckInStatus } from '../../features/checkin/checkin.types'

type StudentClassListItemProps = {
  cls: ScheduledClass
  checkIn?: CheckInRecord
}

function statusBadge(status: CheckInStatus) {
  if (status === 'pending') {
    return (
      <span className="inline-block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2 border border-line px-2 py-1">
        AGUARDANDO
      </span>
    )
  }

  if (status === 'approved') {
    return (
      <span className="inline-block font-mono text-[9px] uppercase tracking-[0.18em] text-red border border-red px-2 py-1">
        PRESENTE
      </span>
    )
  }

  return (
    <span className="inline-block font-mono text-[9px] uppercase tracking-[0.18em] text-red px-2 py-1">
      RECUSADO
    </span>
  )
}

export function StudentClassListItem({ cls, checkIn }: StudentClassListItemProps) {
  const navigate = useNavigate()
  const professorName = cls.instructor.nickname ?? cls.instructor.fullName
  const state = checkIn?.status ?? 'idle'

  return (
    <Card className="flex items-stretch">
      <div className="w-[76px] shrink-0 py-3 border-r border-line flex flex-col items-center justify-center">
        <span className="font-display text-[22px] leading-none">
          {formatScheduleTime(cls.startTime)}
        </span>
        <span className="font-mono text-[9px] text-muted tracking-[0.15em] mt-1">
          {formatClassDuration(cls.durationMinutes)}
        </span>
      </div>

      <div className="flex-1 min-w-0 px-3 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">
            {formatClassLevel(cls.level)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">·</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">
            Prof. {professorName.toUpperCase()}
          </span>
        </div>
        <p className="font-display text-[17px] uppercase tracking-[-0.01em] leading-tight mt-1 truncate">
          {cls.title}
        </p>
      </div>

      <div className="shrink-0 flex items-center px-3">
        {state === 'idle' ? (
          <PrimaryButton
            onClick={() => navigate(`/aluno/aula/${cls.id}`)}
            className="min-h-[44px] text-[13px] px-3"
          >
            FAZER CHECK-IN
          </PrimaryButton>
        ) : (
          statusBadge(state)
        )}
      </div>
    </Card>
  )
}
