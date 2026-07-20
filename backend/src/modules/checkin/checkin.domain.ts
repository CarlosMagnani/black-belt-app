/**
 * Pure domain rules for check-in eligibility.
 * No database access, no side effects.
 *
 * All time comparisons use America/Sao_Paulo wall-clock time.
 */

/**
 * Returns true if the class is scheduled for the given date's day-of-week.
 * @param dayOfWeek - ClassSchedule.dayOfWeek (0=Sun … 6=Sat)
 * @param todayDayOfWeek - day-of-week in São Paulo (0=Sun … 6=Sat)
 */
export function isClassScheduledToday(
  dayOfWeek: number,
  todayDayOfWeek: number
): boolean {
  return dayOfWeek === todayDayOfWeek
}

/**
 * Returns true if the current time in São Paulo is at or after the
 * class start time (same-day lower-bound check).
 *
 * @param startTime - ClassSchedule.startTime in "HH:mm" format
 * @param nowTime - Current time in "HH:mm" format (São Paulo)
 */
export function isAfterClassStartTime(startTime: string, nowTime: string): boolean {
  return nowTime >= startTime
}

/**
 * Combined eligibility check for creating a new check-in request.
 *
 * Returns an object with `eligible: true` if the class is active, scheduled
 * for today, and the current time is past the start time. Otherwise returns
 * `{ eligible: false, reason: … }`.
 *
 * @param isActive - Whether the ClassSchedule is active
 * @param dayOfWeek - ClassSchedule.dayOfWeek (0=Sun … 6=Sat)
 * @param todayDayOfWeek - day-of-week in São Paulo (0=Sun … 6=Sat)
 * @param startTime - ClassSchedule.startTime in "HH:mm"
 * @param nowTime - Current time in São Paulo as "HH:mm"
 */
export function isEligibleToday(
  isActive: boolean,
  dayOfWeek: number,
  todayDayOfWeek: number,
  startTime: string,
  nowTime: string
): { eligible: true } | { eligible: false; reason: 'class_not_active' | 'class_not_today' | 'not_yet_time' } {
  if (!isActive) {
    return { eligible: false, reason: 'class_not_active' }
  }

  if (!isClassScheduledToday(dayOfWeek, todayDayOfWeek)) {
    return { eligible: false, reason: 'class_not_today' }
  }

  if (!isAfterClassStartTime(startTime, nowTime)) {
    return { eligible: false, reason: 'not_yet_time' }
  }

  return { eligible: true }
}
