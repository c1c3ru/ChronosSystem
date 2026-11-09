import MailComposer from 'nodemailer/lib/mail-composer'
import { env } from './env'

/**
 * Envio de e-mail pela API HTTP do Gmail (users.messages.send), autenticada
 * por OAuth2 com refresh token da conta remetente.
 *
 * Por que não SMTP: na Vercel, toda conexão SMTP com smtp.gmail.com falhava
 * em `getaddrinfo EBUSY` (desde pelo menos 28/09/2026 nenhum lembrete saiu).
 * A API do Gmail usa HTTPS para os mesmos domínios do Google que o login via
 * NextAuth já acessa normalmente, então não depende da conexão SMTP.
 *
 * Configuração (ver .env.example / docs/EMAIL_SETUP_GUIDE.md):
 * - GMAIL_REFRESH_TOKEN: refresh token da conta remetente, com escopo
 *   https://www.googleapis.com/auth/gmail.send
 * - GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET: cliente OAuth que emitiu o token.
 *   Opcionais — por padrão reaproveita GOOGLE_CLIENT_ID/SECRET (o mesmo
 *   cliente do login).
 * - MAIL_FROM (ou SMTP_FROM, por compatibilidade): remetente exibido. Precisa
 *   ser a própria conta do refresh token (ou um alias "Enviar como" dela).
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

/** Teto de cada chamada HTTP — bem abaixo de CRON_SEND_TIMEOUT_MS (12s). */
const HTTP_TIMEOUT_MS = 8_000

/** Margem para renovar o access token antes de ele expirar de fato. */
const TOKEN_EXPIRY_MARGIN_MS = 60_000

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

/**
 * Erro da API do Gmail. `transient` indica se tentar de novo pode resolver
 * (rede, timeout, 429, 5xx, access token expirado) ou não (refresh token
 * revogado, remetente não autorizado, destinatário inválido).
 */
export class GmailApiError extends Error {
  readonly transient: boolean
  readonly status?: number

  constructor(message: string, transient: boolean, status?: number) {
    super(message)
    this.name = 'GmailApiError'
    this.transient = transient
    this.status = status
  }
}

export interface GmailMessage {
  from: string
  to: string
  subject: string
  html: string
  text?: string
}

interface GmailCredentials {
  clientId: string
  clientSecret: string
  refreshToken: string
}

function getCredentials(): GmailCredentials {
  return {
    clientId: env.GMAIL_CLIENT_ID || env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GMAIL_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: env.GMAIL_REFRESH_TOKEN || '',
  }
}

export function isGmailApiConfigured(): boolean {
  const { clientId, clientSecret, refreshToken } = getCredentials()
  return Boolean(clientId && clientSecret && refreshToken)
}

let cachedToken: { value: string; expiresAt: number } | null = null

/** Só para testes. */
export function resetGmailTokenCache(): void {
  cachedToken = null
}

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

/**
 * fetch com timeout. Falhas de rede/DNS (`TypeError: fetch failed`) e
 * estouro de tempo viram GmailApiError transitório.
 */
async function request(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  } catch (error: unknown) {
    // `cause` (ES2022) traz o motivo real de "fetch failed" (ex.: DNS).
    const rawCause = error instanceof Error ? (error as { cause?: unknown }).cause : undefined
    const cause = rawCause instanceof Error ? `: ${rawCause.message}` : ''
    const reason = error instanceof Error ? `${error.message}${cause}` : String(error)
    throw new GmailApiError(`Erro de rede ao chamar ${new URL(url).host} (${reason})`, true)
  }
}

async function readError(response: Response): Promise<string> {
  const body = await response.text().catch(() => '')
  try {
    const parsed = JSON.parse(body) as {
      error?: string | { message?: string }
      error_description?: string
    }
    if (typeof parsed.error === 'string') {
      return parsed.error_description
        ? `${parsed.error}: ${parsed.error_description}`
        : parsed.error
    }
    if (parsed.error?.message) return parsed.error.message
  } catch {
    // corpo não é JSON — usa o texto bruto
  }
  return body.slice(0, 300) || response.statusText
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_EXPIRY_MARGIN_MS > Date.now()) {
    return cachedToken.value
  }

  const { clientId, clientSecret, refreshToken } = getCredentials()
  const response = await request(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  })

  if (!response.ok) {
    const reason = await readError(response)
    const hint = reason.includes('invalid_grant')
      ? ' — o GMAIL_REFRESH_TOKEN expirou ou foi revogado; gere um novo'
      : ''
    throw new GmailApiError(
      `Falha ao obter access token do Google (HTTP ${response.status}: ${reason})${hint}`,
      isTransientStatus(response.status),
      response.status
    )
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) {
    throw new GmailApiError('Resposta do Google sem access_token', true)
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  }
  return cachedToken.value
}

/** Monta a mensagem MIME (UTF-8, multipart texto/HTML) em base64url. */
async function buildRawMessage(message: GmailMessage): Promise<string> {
  const mime = await new MailComposer({
    from: message.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })
    .compile()
    .build()
  return mime.toString('base64url')
}

/**
 * Envia uma mensagem e devolve o id dela no Gmail. Lança GmailApiError em
 * qualquer falha; o retry fica a cargo do chamador (EmailService).
 */
export async function sendViaGmailApi(message: GmailMessage): Promise<string> {
  const raw = await buildRawMessage(message)
  const accessToken = await getAccessToken()

  const response = await request(SEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!response.ok) {
    const reason = await readError(response)
    // 401: access token expirou/foi revogado antes do previsto — descarta o
    // cache para a próxima tentativa buscar outro.
    if (response.status === 401) cachedToken = null
    throw new GmailApiError(
      `Gmail API recusou o envio (HTTP ${response.status}: ${reason})`,
      response.status === 401 || isTransientStatus(response.status),
      response.status
    )
  }

  const data = (await response.json()) as { id?: string }
  return data.id ?? ''
}
