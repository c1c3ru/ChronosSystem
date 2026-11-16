/**
 * Vigência de contratos de estagiários na data civil de Fortaleza.
 *
 * As datas cadastradas são dias do calendário. Não converter meia-noite UTC
 * para o fuso do navegador: isso faria datas aparecerem no dia anterior.
 * O relógio da página usa getNowInFortaleza (dia local expresso em UTC).
 */
export type ContractUrgency =
  | 'MISSING'
  | 'FUTURE'
  | 'NORMAL'
  | 'WARNING'
  | 'URGENT'
  | 'CRITICAL'
  | 'EXPIRED'

export interface ContractExpiration {
  urgency: ContractUrgency
  daysRemaining: number | null
  message: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function calendarDay(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value)
  if (!match) return null

  const dateMs = Date.parse(match[0] + 'T00:00:00.000Z')
  if (!Number.isFinite(dateMs)) return null
  if (new Date(dateMs).toISOString().slice(0, 10) !== match[0]) return null
  return dateMs
}

export function formatContractDate(value: string | null | undefined): string {
  const dateMs = calendarDay(value)
  if (dateMs === null) return '—'

  const date = new Date(dateMs)
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return day + '/' + month + '/' + date.getUTCFullYear()
}

export function getContractExpiration(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  fortalezaNow: Date
): ContractExpiration {
  const endMs = calendarDay(endDate)
  if (endMs === null) {
    return { urgency: 'MISSING', daysRemaining: null, message: 'Fim não informado' }
  }

  const todayMs = Date.UTC(
    fortalezaNow.getUTCFullYear(),
    fortalezaNow.getUTCMonth(),
    fortalezaNow.getUTCDate()
  )
  const daysRemaining = Math.round((endMs - todayMs) / DAY_MS)

  if (daysRemaining < 0) {
    const daysLate = Math.abs(daysRemaining)
    return {
      urgency: 'EXPIRED',
      daysRemaining,
      message: 'Vencido há ' + daysLate + (daysLate === 1 ? ' dia' : ' dias'),
    }
  }
  if (daysRemaining <= 15) {
    return {
      urgency: 'CRITICAL',
      daysRemaining,
      message:
        daysRemaining === 0
          ? 'Vence hoje'
          : 'Vence em ' + daysRemaining + (daysRemaining === 1 ? ' dia' : ' dias'),
    }
  }
  if (daysRemaining <= 30) {
    return {
      urgency: 'URGENT',
      daysRemaining,
      message: 'Vence em ' + daysRemaining + ' dias',
    }
  }
  if (daysRemaining <= 60) {
    return {
      urgency: 'WARNING',
      daysRemaining,
      message: 'Vence em ' + daysRemaining + ' dias',
    }
  }

  const startMs = calendarDay(startDate)
  if (startMs !== null && startMs > todayMs) {
    return { urgency: 'FUTURE', daysRemaining, message: 'Ainda não iniciou' }
  }

  return { urgency: 'NORMAL', daysRemaining, message: 'Em vigor' }
}
