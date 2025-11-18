/**
 * Funções para gerenciar timezone de Fortaleza-CE (UTC-3)
 */

/**
 * Retorna a data/hora atual em Fortaleza-CE
 */
export function getNowInFortaleza(): Date {
  const now = new Date()
  // Fortaleza está em UTC-3
  const fortalezaTime = new Date(now.toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }))
  return fortalezaTime
}

/**
 * Converte uma data para string formatada em Fortaleza
 */
export function formatDateFortaleza(date: Date): string {
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Retorna apenas a hora em Fortaleza (HH:mm:ss)
 */
export function getTimeFortaleza(date: Date = new Date()): string {
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Retorna apenas a data em Fortaleza (DD/MM/YYYY)
 */
export function getDateFortaleza(date: Date = new Date()): string {
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Retorna a data em ISO format mas com timezone de Fortaleza
 */
export function getISODateFortaleza(date: Date = new Date()): string {
  const fortalezaDate = new Date(date.toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }))
  return fortalezaDate.toISOString()
}
