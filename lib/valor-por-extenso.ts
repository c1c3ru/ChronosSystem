/**
 * Valores em reais: leitura do texto digitado (com ou sem "R$") e escrita por extenso,
 * como exigem os termos de estágio ("R$ 600,00 (seiscentos reais)").
 */

const UNIDADES = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
]
const DEZENAS = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
]
const CENTENAS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
]

/** Converte texto como "R$ 1.234,56", "1234,5" ou "600" em centavos. Inválido → null. */
export function parseBRL(value?: string | null): number | null {
  if (!value) return null
  const clean = value.replace(/R\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  return Math.round(parseFloat(clean) * 100)
}

/** Centavos → "1.234,56" (sem o símbolo). */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** 0–999 por extenso. */
function ate999(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'
  const c = Math.floor(n / 100)
  const resto = n % 100
  const partes: string[] = []
  if (c) partes.push(CENTENAS[c])
  if (resto < 20) {
    if (resto) partes.push(UNIDADES[resto])
  } else {
    const d = Math.floor(resto / 10)
    const u = resto % 10
    partes.push(u ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d])
  }
  return partes.join(' e ')
}

/** Inteiro (até 999.999.999) por extenso. */
export function numeroPorExtenso(n: number): string {
  if (n === 0) return 'zero'
  const milhoes = Math.floor(n / 1_000_000)
  const milhares = Math.floor((n % 1_000_000) / 1000)
  const resto = n % 1000

  const grupos: string[] = []
  if (milhoes) grupos.push(milhoes === 1 ? 'um milhão' : `${ate999(milhoes)} milhões`)
  if (milhares) grupos.push(milhares === 1 ? 'mil' : `${ate999(milhares)} mil`)
  if (resto) grupos.push(ate999(resto))

  if (grupos.length === 1) return grupos[0]
  // "e" antes do último grupo quando ele é < 100 ou uma centena redonda (ex.: "mil e duzentos")
  const ultimo = grupos.pop() as string
  const usaE = resto > 0 && (resto < 100 || resto % 100 === 0)
  return `${grupos.join(' ')}${usaE ? ' e ' : ' '}${ultimo}`
}

/** Valor em reais por extenso: "R$ 1.234,56" → "mil duzentos e trinta e quatro reais e cinquenta e seis centavos". */
export function valorPorExtenso(value?: string | null): string {
  const cents = parseBRL(value)
  if (cents === null) return ''
  const reais = Math.floor(cents / 100)
  const centavos = cents % 100

  const partes: string[] = []
  if (reais) {
    const sufixoDe = reais % 1_000_000 === 0 ? ' de' : ''
    partes.push(`${numeroPorExtenso(reais)}${sufixoDe} ${reais === 1 ? 'real' : 'reais'}`)
  }
  if (centavos) {
    partes.push(`${numeroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`)
  }
  return partes.length ? partes.join(' e ') : 'zero real'
}

/** "R$ 600,00 (seiscentos reais)"; texto inválido é devolvido como veio. */
export function valorComExtenso(value?: string | null): string {
  const cents = parseBRL(value)
  if (cents === null) return value?.trim() ?? ''
  return `R$ ${formatBRL(cents)} (${valorPorExtenso(value)})`
}
