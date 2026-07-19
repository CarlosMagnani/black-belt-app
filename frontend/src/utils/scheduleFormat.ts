const DAY_LABELS: Record<number, string> = {
  0: 'DOM',
  1: 'SEG',
  2: 'TER',
  3: 'QUA',
  4: 'QUI',
  5: 'SEX',
  6: 'SAB',
}

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

const LEVEL_LABELS: Record<string, string> = {
  todas: 'Todas',
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

// Backend stores 0=Sun..6=Sat. UI groups Mon-first.
export const SCHEDULE_DAY_ORDER: number[] = [1, 2, 3, 4, 5, 6, 0]

export function formatScheduleDay(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? '-'
}

export function formatScheduleDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? '-'
}

export function formatScheduleTime(startTime: string): string {
  return startTime
}

export function formatClassDuration(minutes: number): string {
  return `${minutes} MIN`
}

export function formatClassLevel(level: string | null): string {
  if (!level) return 'Sem nível'
  return LEVEL_LABELS[level] ?? level
}

export function nowInSaoPaulo(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
}

export function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function isClassToday(classSchedule: { dayOfWeek: number }, today: Date): boolean {
  return classSchedule.dayOfWeek === today.getDay()
}

export function formatClassTimeRange(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + durationMinutes
  const endHours = Math.floor(endMinutes / 60) % 24
  const endMins = endMinutes % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${startTime} — ${pad(endHours)}:${pad(endMins)}`
}

export function formatTodayHeader(date: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
  })
    .format(date)
    .replace(/\./g, '')
    .toUpperCase()

  const day = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
  }).format(date)

  const month = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    month: 'short',
  })
    .format(date)
    .replace(/\./g, '')
    .toUpperCase()

  return `${weekday} · ${day} ${month}`
}
