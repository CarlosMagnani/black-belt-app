import type { ClassLevel } from '../features/schedule/schedule.types'

type LevelPillProps = {
  value: ClassLevel | null
  onChange: (level: ClassLevel | null) => void
  name?: string
  allowEmpty?: boolean
  error?: string
}

const LEVELS: { value: ClassLevel; label: string }[] = [
  { value: 'todas', label: 'TODAS' },
  { value: 'iniciante', label: 'INICIANTE' },
  { value: 'intermediario', label: 'INTERMEDIÁRIO' },
  { value: 'avancado', label: 'AVANÇADO' },
]

export function LevelPill({ value, onChange, name, allowEmpty = false, error }: LevelPillProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Nível da aula" data-name={name}>
        {allowEmpty && (
          <button
            type="button"
            aria-pressed={value === null}
            onClick={() => onChange(null)}
            className={`h-[44px] px-3 font-mono text-[9px] uppercase tracking-[0.12em] border transition ${
              value === null
                ? 'border-red bg-surface text-text'
                : 'border-line text-muted-2'
            }`}
          >
            SEM NÍVEL
          </button>
        )}
        {LEVELS.map((level) => {
          const isActive = value === level.value
          return (
            <button
              key={level.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(level.value)}
              className={`h-[44px] px-3 font-mono text-[9px] uppercase tracking-[0.12em] border transition ${
                isActive
                  ? 'border-red bg-surface text-text'
                  : 'border-line text-muted-2'
              }`}
            >
              {level.label}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-[12px] text-red">{error}</p>}
    </div>
  )
}
