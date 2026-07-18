/**
 * Brazil time utilities using only Intl.DateTimeFormat — no external deps.
 *
 * We deliberately avoid libraries (luxon, date-fns-tz, dayjs) to keep the
 * dependency footprint minimal for the MVP. Intl.DateTimeFormat is available
 * in all supported Node.js versions and gives us correct America/Sao_Paulo
 * offsets including daylight saving transitions.
 */

/**
 * Returns a Date object whose UTC value corresponds to "now" in
 * America/Sao_Paulo. The returned Date's getHours/getMinutes etc. will
 * reflect the wall-clock time in São Paulo.
 */
export function nowInSaoPaulo(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )
}

/**
 * Returns today's date in São Paulo as a YYYY-MM-DD string.
 * Uses en-CA locale which formats as YYYY-MM-DD by default.
 */
export function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
