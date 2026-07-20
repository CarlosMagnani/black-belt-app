import type { ApiError } from '../../lib/api'

const MESSAGES: Record<string, string> = {
  class_not_active: 'Esta aula não está mais ativa.',
  class_not_today: 'Esta aula não é hoje.',
  not_yet_time: 'A aula ainda não começou. Tente novamente no horário.',
  already_rejected: 'Sua presença foi recusada. Não é possível tentar novamente.',
  already_requested: 'Você já fez check-in para esta aula.',
  class_not_found: 'Aula não encontrada.',
  forbidden: 'Você não é membro desta academia.',
  invalid_input: 'Dados inválidos.',
}

export function getCheckInErrorMessage(error: ApiError | null | undefined): string {
  if (!error) return 'Não foi possível fazer check-in. Tente novamente.'
  return MESSAGES[error.code] ?? 'Não foi possível fazer check-in. Tente novamente.'
}
