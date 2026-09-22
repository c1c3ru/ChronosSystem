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
 * Uso correto: comparações de horário de turno, início/fim do dia local e o
 * timestamp gravado nos registros de ponto.
 *
 * Convenção de fuso do sistema: os registros de ponto são gravados com este
 * relógio, ou seja, a hora de parede de Fortaleza codificada como UTC. Quem lê
 * esses campos usa os getters UTC (`getUTCHours`, `getUTCDate`) ou formata com
 * `timeZone: 'UTC'` — nunca converte de UTC para America/Fortaleza, porque isso
 * aplicaria o deslocamento de -3h uma segunda vez.
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

/**
 * Início do dia (00:00) em Fortaleza, na mesma codificação usada para gravar os
 * registros de ponto.
 *
 * Substitui o padrão `new Date()` + `setHours(0, 0, 0, 0)`, que espalhava dois
 * erros pelas rotas: usava o dia de quem roda o processo (UTC, na Vercel) em
 * vez do dia de Fortaleza, o que jogava todo registro feito entre 21:00 e a
 * meia-noite para o dia seguinte; e dependia do fuso do processo, então o mesmo
 * código dava respostas diferentes no servidor e na máquina de quem desenvolve.
 *
 * Sem argumento, usa o dia corrente de Fortaleza. Com argumento, espera um Date
 * já nessa codificação — o que veio do banco, ou de `getNowInFortaleza()`.
 */
export function startOfDayInFortaleza(reference: Date = getNowInFortaleza()): Date {
  const inicio = new Date(reference)
  inicio.setUTCHours(0, 0, 0, 0)
  return inicio
}

/** Fim do dia (23:59:59.999) em Fortaleza. Ver `startOfDayInFortaleza`. */
export function endOfDayInFortaleza(reference: Date = getNowInFortaleza()): Date {
  const fim = new Date(reference)
  fim.setUTCHours(23, 59, 59, 999)
  return fim
}

/**
 * Soma (ou subtrai, com valor negativo) dias sem sair da codificação de
 * Fortaleza. Usa os setters UTC, então não depende do fuso do processo nem
 * escorrega em horário de verão de outro fuso.
 */
export function addDaysInFortaleza(reference: Date, days: number): Date {
  const resultado = new Date(reference)
  resultado.setUTCDate(resultado.getUTCDate() + days)
  return resultado
}

/**
 * Converte uma data vinda de fora (query string `YYYY-MM-DD`, corpo de
 * requisição) para a codificação de Fortaleza. Um `YYYY-MM-DD` puro já é
 * interpretado como meia-noite UTC pelo `Date`, que é exatamente a meia-noite
 * de Fortaleza nessa codificação; a função existe para deixar a intenção
 * explícita e para normalizar o horário quando vem um timestamp completo.
 */
export function parseDateInFortaleza(value: string | Date): Date {
  return startOfDayInFortaleza(new Date(value))
}
