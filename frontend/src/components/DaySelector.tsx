import { SCHEDULE_DAY_ORDER, formatScheduleDay } from '../utils/scheduleFormat'

type DaySelectorProps = {
  value: number
  onChange: (day: number) => void
  name?: string
  error?: string
}

export function DaySelector({ value, onChange, name, error }: DaySelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Dia da semana">
        {SCHEDULE_DAY_ORDER.map((day) => {
          const isActive = day === value
          return (
            <button
              key={day}
              type="button"
              name={name}
              aria-pressed={isActive}
              onClick={() => onChange(day)}
              className={`min-w-[44px] h-[44px] px-3 font-mono text-[10px] uppercase tracking-[0.12em] border transition ${
                isActive
                  ? 'bg-red text-text border-red'
                  : 'bg-surface text-text-2 border-line'
              }`}
            >
              {formatScheduleDay(day)}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-[12px] text-red">{error}</p>}
    </div>
  )
}
