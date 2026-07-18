export const BELT_COLORS: Record<string, string> = {
  white: '#F0F0F0',
  blue: '#1A52A8',
  purple: '#6B3FA0',
  brown: '#7B3F00',
  black: '#0A0A0A',
  coral: '#FF7F50',
  red: '#CC0000',
}

export function beltColor(belt: string): string {
  return BELT_COLORS[belt] ?? '#242424'
}

export function beltTextColor(belt: string): string {
  return belt === 'white' ? '#0A0A0A' : '#F5F5F5'
}

export const BELT_LABELS: Record<string, string> = {
  white: 'Branca',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
  coral: 'Coral',
  red: 'Vermelha',
}

export function formatBeltLabel(belt: string, degree: number): string {
  const label = BELT_LABELS[belt] ?? belt
  const grau = degree === 1 ? 'grau' : 'graus'
  return `Faixa ${label} · ${degree}º ${grau}`
}
