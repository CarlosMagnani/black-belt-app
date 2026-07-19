/**
 * Pure domain rules for roster and role management.
 * No database access, no side effects.
 */

export function isValidPromotion(fromRole: string, toRole: string): boolean {
  if (fromRole !== 'student') return false
  if (toRole !== 'professor') return false
  return true
}

export function isValidRevocation(fromRole: string, toRole: string): boolean {
  if (fromRole !== 'professor') return false
  if (toRole !== 'student') return false
  return true
}

export function canRevokeProfessor(activeClassCount: number): boolean {
  return activeClassCount === 0
}
