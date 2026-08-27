import crypto from 'crypto'
import { env } from './env'
import type { VisitShift } from './lab-visits'

/**
 * Integração com o Google Calendar — dispara a criação de um evento sempre
 * que uma visita de laboratório é APROVADA (PENDING -> CONFIRMED).
 *
 * Segue o mesmo padrão de "degradação graciosa" de lib/mailer.ts: sem as
 * credenciais da Service Account configuradas, a função não lança erro —
 * apenas loga um aviso e retorna `{ eventId: null }`. A rota de aprovação
 * nunca deve falhar por causa de uma integração externa opcional.
 */

export interface CalendarVisitInput {
  visitId: string
  labSigla: string
  labNome: string
  responsibleName: string
  schoolName: string
  studentCount: number
  visitDate: Date
  shift: VisitShift
}

export interface CalendarEventResult {
  eventId: string | null
}

const SHIFT_TIME_RANGES: Record<VisitShift, { startHour: number; endHour: number }> = {
  MORNING: { startHour: 8, endHour: 12 },
  AFTERNOON: { startHour: 13, endHour: 17 },
  NIGHT: { startHour: 18, endHour: 22 },
}

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    env.GOOGLE_CALENDAR_CLIENT_EMAIL && env.GOOGLE_CALENDAR_PRIVATE_KEY && env.GOOGLE_CALENDAR_ID
  )
}

function buildEventWindow(visitDate: Date, shift: VisitShift): { start: Date; end: Date } {
  const { startHour, endHour } = SHIFT_TIME_RANGES[shift]
  const start = new Date(visitDate)
  start.setHours(startHour, 0, 0, 0)
  const end = new Date(visitDate)
  end.setHours(endHour, 0, 0, 0)
  return { start, end }
}

/**
 * Troca a chave privada da Service Account por um access token OAuth2
 * (fluxo JWT Bearer, RFC 7523) usando apenas `crypto` nativo — evita
 * adicionar a dependência `googleapis` só para essa chamada.
 */
async function getAccessToken(): Promise<string | null> {
  const clientEmail = env.GOOGLE_CALENDAR_CLIENT_EMAIL
  const privateKey = env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!clientEmail || !privateKey) return null

  const nowSeconds = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: clientEmail,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }

  const base64url = (input: string) =>
    Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), privateKey)
  const assertion = `${unsigned}.${signature.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) return null
  const data = (await response.json()) as { access_token?: string }
  return data.access_token ?? null
}

/**
 * Cria o evento no Google Calendar para uma visita recém-aprovada.
 * Nunca lança — falhas de rede/credenciais resultam em `eventId: null`,
 * registradas via console, para não travar a aprovação em si.
 */
export async function createCalendarEvent(input: CalendarVisitInput): Promise<CalendarEventResult> {
  if (!isGoogleCalendarConfigured()) {
    console.warn(
      '[google-calendar] Integração não configurada (GOOGLE_CALENDAR_CLIENT_EMAIL/PRIVATE_KEY/ID ausentes) — evento não criado para visita',
      input.visitId
    )
    return { eventId: null }
  }

  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      console.error('[google-calendar] Falha ao obter access token — evento não criado')
      return { eventId: null }
    }

    const { start, end } = buildEventWindow(input.visitDate, input.shift)
    const calendarId = env.GOOGLE_CALENDAR_ID as string

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `Visita ao ${input.labSigla} — ${input.schoolName}`,
          description: [
            `Laboratório: ${input.labSigla} (${input.labNome})`,
            `Escola: ${input.schoolName}`,
            `Responsável: ${input.responsibleName}`,
            `Quantidade de alunos: ${input.studentCount}`,
          ].join('\n'),
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        }),
      }
    )

    if (!response.ok) {
      console.error('[google-calendar] API retornou erro ao criar evento', response.status)
      return { eventId: null }
    }

    const data = (await response.json()) as { id?: string }
    return { eventId: data.id ?? null }
  } catch (error: unknown) {
    console.error(
      '[google-calendar] Erro inesperado ao criar evento:',
      error instanceof Error ? error.message : String(error)
    )
    return { eventId: null }
  }
}
