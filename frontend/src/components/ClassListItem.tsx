import { Card } from './Card'
import { IconButton } from './IconButton'
import { ChevronRightIcon, EditIcon, TrashIcon } from './Icons'
import { formatClassDuration, formatClassLevel, formatScheduleTime } from '../utils/scheduleFormat'
import type { ScheduledClass } from '../features/schedule/schedule.types'

type ClassListItemProps = {
  cls: ScheduledClass
  onEdit?: () => void
  onDeactivate?: () => void
  isOwner: boolean
}

export function ClassListItem({ cls, onEdit, onDeactivate, isOwner }: ClassListItemProps) {
  const isInactive = !cls.isActive
  const levelLabel = formatClassLevel(cls.level)
  const professorName = cls.instructor.nickname ?? cls.instructor.fullName

  return (
    <Card className={`flex items-stretch ${isInactive ? 'opacity-60' : ''}`}>
      {/* time block */}
      <div className="w-[76px] shrink-0 py-3 border-r border-line flex flex-col items-center justify-center">
        <span className="font-display text-[22px] leading-none">
          {formatScheduleTime(cls.startTime)}
        </span>
        <span className="font-mono text-[9px] text-muted tracking-[0.15em] mt-1">
          {formatClassDuration(cls.durationMinutes)}
        </span>
      </div>

      {/* content */}
      <div className="flex-1 min-w-0 px-3 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">
            {levelLabel}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">
            ·
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">
            Prof. {professorName.toUpperCase()}
          </span>
          {isInactive && (
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-red border border-red px-1.5 py-0.5">
              DESATIVADA
            </span>
          )}
        </div>
        <p className="font-display text-[17px] uppercase tracking-[-0.01em] leading-tight mt-1 mb-1 truncate">
          {cls.title}
        </p>
        <p className="text-[12px] text-muted-2 truncate">
          {cls.location ?? '—'}
        </p>
      </div>

      {/* actions */}
      <div className="shrink-0 flex items-center px-2 gap-1">
        {isOwner ? (
          <>
            <IconButton
              aria-label="Editar aula"
              onClick={onEdit}
              disabled={!onEdit}
              className="text-text-2"
            >
              <EditIcon className="w-[16px] h-[16px]" />
            </IconButton>
            <IconButton
              aria-label="Desativar aula"
              onClick={onDeactivate}
              disabled={!onDeactivate || isInactive}
              className="text-red"
            >
              <TrashIcon className="w-[16px] h-[16px]" />
            </IconButton>
          </>
        ) : (
          <div className="px-2">
            <ChevronRightIcon className="w-[16px] h-[16px] text-muted-2" />
          </div>
        )}
      </div>
    </Card>
  )
}
