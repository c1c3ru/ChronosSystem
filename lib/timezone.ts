/**
 * Funções para gerenciar timezone de Fortaleza-CE (UTC-3)
 */

/**
 * Retorna a data/hora atual em Fortaleza-CE (BRT, UTC-3, sem horário de verão).
 * O Date retornado tem os métodos .getUTCHours(), .getUTCMinutes(), .getUTCDate()
 * etc. (e qualquer formatação com `timeZone: 'UTC'`, o padrão usado em toda a
 * aplicação) refletindo a hora local de Fortaleza — independente do fuso de
 * quem chama, seja o servidor ou o navegador de quem está usando a página.
 *
 * Uso correto: comparações de horário de turno, início/fim do dia local.
 * NÃO usar como timestamp UTC para salvar no banco — use `new Date()` para isso.
 */
export function getNowInFortaleza(): Date {
  // UTC-3 fixo (Fortaleza não adota horário de verão). Date.now() é sempre o
  // instante UTC real, então este deslocamento fixo dá a hora certa não
  // importa o fuso de onde a função roda. Uma versão anterior tentava
  // "cancelar" o fuso de quem chama via getTimezoneOffset() antes de aplicar
  // esse deslocamento — funcionava no servidor (Vercel roda em UTC, então a
  // cancelagem era zero), mas quebrava ao rodar no navegador de um terminal
  // já configurado para o fuso do Brasil: a cancelagem anulava o próprio
  // deslocamento de -3h, deixando o relógio exibido 3h adiantado (ex.: o
  // relógio do Kiosk, que roda no dispositivo do terminal).
  const BRT_OFFSET_MS = -3 * 60 * 60 * 1000
  return new Date(Date.now() + BRT_OFFSET_MS)
}
