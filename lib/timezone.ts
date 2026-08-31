/**
 * Funções para gerenciar timezone de Fortaleza-CE (UTC-3)
 */

/**
 * Retorna a data/hora atual em Fortaleza-CE (BRT, UTC-3, sem horário de verão).
 * O Date retornado tem os métodos .getHours(), .getMinutes(), .getDate() etc.
 * refletindo a hora local de Fortaleza, independente do timezone do servidor.
 *
 * Uso correto: comparações de horário de turno, início/fim do dia local.
 * NÃO usar como timestamp UTC para salvar no banco — use `new Date()` para isso.
 */
export function getNowInFortaleza(): Date {
  const now = new Date()
  // UTC-3 fixo (Fortaleza não adota horário de verão)
  const BRT_OFFSET_MS = -3 * 60 * 60 * 1000
  // getTimezoneOffset() retorna minutos de diferença local→UTC (positivo a oeste)
  const serverOffsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() + BRT_OFFSET_MS + serverOffsetMs)
}
