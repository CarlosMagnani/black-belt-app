import { Card } from './Card'
import { ClassListItem } from './ClassListItem'
import { SCHEDULE_DAY_ORDER, formatScheduleDayName } from '../utils/scheduleFormat'
import type { ScheduledClass } from '../features/schedule/schedule.types'

type WeeklyScheduleGridProps = {
  classes: ScheduledClass[]
  isOwner: boolean
  onEditClass: (cls: ScheduledClass) => void
  onDeactivateClass: (cls: ScheduledClass) => void
  onAddClass: () => void
}

export function WeeklyScheduleGrid(props: WeeklyScheduleGridProps) {
  const { classes, isOwner, onEditClass, onDeactivateClass } = props
  const byDay = new Map<number, ScheduledClass[]>()
  for (const day of SCHEDULE_DAY_ORDER) {
    byDay.set(day, [])
  }

  for (const cls of classes) {
    const list = byDay.get(cls.dayOfWeek) ?? []
    list.push(cls)
    byDay.set(cls.dayOfWeek, list)
  }

  // Sort each day's classes by start time.
  for (const list of byDay.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <div className="space-y-6">
      {SCHEDULE_DAY_ORDER.map((day) => {
        const dayClasses = byDay.get(day) ?? []
        return (
          <section key={day}>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">
                  {formatScheduleDayName(day)}
                </p>
                <p className="font-display text-[18px] uppercase tracking-[-0.01em] leading-[0.95]">
                  {dayClasses.length} AULA{dayClasses.length === 1 ? '' : 'S'}
                </p>
              </div>
            </div>
            {dayClasses.length === 0 ? (
              <Card className="p-4 text-center">
                <span className="text-[20px] text-muted">—</span>
              </Card>
            ) : (
              <div className="space-y-3">
                {dayClasses.map((cls) => (
                  <ClassListItem
                    key={cls.id}
                    cls={cls}
                    isOwner={isOwner}
                    onEdit={() => onEditClass(cls)}
                    onDeactivate={() => onDeactivateClass(cls)}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
