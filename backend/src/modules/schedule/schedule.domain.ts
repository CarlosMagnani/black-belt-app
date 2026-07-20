/**
 * Pure domain rules for class schedule management.
 * No database access, no side effects.
 */

/**
 * Validates that the given member can be assigned as an instructor.
 * Only academy owners and professors can be instructors.
 */
export function isValidInstructor(
  member: { role: string; status: string } | null | undefined
): boolean {
  if (!member) return false
  if (member.status !== 'active') return false
  return member.role === 'owner' || member.role === 'professor'
}
