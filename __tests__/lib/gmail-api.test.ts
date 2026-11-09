/**
 * @jest-environment node
 */

/**
 * Envio pela API HTTP do Gmail: troca do refresh token por access token (com
 * cache), montagem da mensagem MIME em base64url e classificação de erros em
 * transitórios (retry) e permanentes.
 */
jest.mock('@/lib/env', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'login-client-id',
    GOOGLE_CLIENT_SECRET: 'login-client-secret',
    GMAIL_CLIENT_ID: '',
    GMAIL_CLIENT_SECRET: '',
    GMAIL_REFRESH_TOKEN: 'refresh-token',
  },
}))

import { env } from '@/lib/env'
import {
  GmailApiError,
  isGmailApiConfigured,
  resetGmailTokenCache,
  sendViaGmailApi,
} from '@/lib/gmail-api'

const mutableEnv = env as unknown as Record<string, string>

const message = {
  from: 'Chronos IFCE <cti@example.com>',
  to: 'aluno@example.com',
  subject: '⏰ Lembrete de ponto',
  html: '<p>Olá, você esqueceu de bater o ponto</p>',
  text: 'Olá, você esqueceu de bater o ponto',
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const tokenOk = () => jsonResponse(200, { access_token: 'access-1', expires_in: 3600 })

describe('lib/gmail-api', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
    resetGmailTokenCache()
    mutableEnv.GMAIL_REFRESH_TOKEN = 'refresh-token'
    mutableEnv.GMAIL_CLIENT_ID = ''
    mutableEnv.GMAIL_CLIENT_SECRET = ''
  })

  it('só se considera configurada com refresh token', () => {
    expect(isGmailApiConfigured()).toBe(true)
    mutableEnv.GMAIL_REFRESH_TOKEN = ''
    expect(isGmailApiConfigured()).toBe(false)
  })

  it('troca o refresh token (com o cliente do login por padrão) e envia a mensagem MIME', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(jsonResponse(200, { id: 'msg-1' }))

    await expect(sendViaGmailApi(message)).resolves.toBe('msg-1')

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0]
    expect(tokenUrl).toBe('https://oauth2.googleapis.com/token')
    const form = new URLSearchParams(tokenInit.body as string)
    expect(form.get('client_id')).toBe('login-client-id')
    expect(form.get('client_secret')).toBe('login-client-secret')
    expect(form.get('refresh_token')).toBe('refresh-token')
    expect(form.get('grant_type')).toBe('refresh_token')

    const [sendUrl, sendInit] = fetchMock.mock.calls[1]
    expect(sendUrl).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages/send')
    expect(sendInit.headers.Authorization).toBe('Bearer access-1')

    const { raw } = JSON.parse(sendInit.body as string) as { raw: string }
    expect(raw).not.toMatch(/[+/=]/) // base64url, sem padding
    const mime = Buffer.from(raw, 'base64url').toString('utf8')
    expect(mime).toMatch(/^From: Chronos IFCE <cti@example.com>/m)
    expect(mime).toMatch(/^To: aluno@example.com/m)
    expect(mime).toMatch(/^Subject: =\?UTF-8\?/m) // emoji codificado
    expect(mime).toContain('multipart/alternative')
  })

  it('usa GMAIL_CLIENT_ID/SECRET quando definidos', async () => {
    mutableEnv.GMAIL_CLIENT_ID = 'gmail-client-id'
    mutableEnv.GMAIL_CLIENT_SECRET = 'gmail-client-secret'
    fetchMock
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(jsonResponse(200, { id: 'msg-1' }))

    await sendViaGmailApi(message)

    const form = new URLSearchParams(fetchMock.mock.calls[0][1].body as string)
    expect(form.get('client_id')).toBe('gmail-client-id')
    expect(form.get('client_secret')).toBe('gmail-client-secret')
  })

  it('reaproveita o access token entre envios', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(jsonResponse(200, { id: 'msg-1' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'msg-2' }))

    await sendViaGmailApi(message)
    await sendViaGmailApi(message)

    expect(fetchMock).toHaveBeenCalledTimes(3) // 1 token + 2 envios
  })

  it('refresh token revogado (invalid_grant) é erro permanente com dica de correção', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { error: 'invalid_grant', error_description: 'Token has been revoked.' })
    )

    const error = await sendViaGmailApi(message).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(GmailApiError)
    expect((error as GmailApiError).transient).toBe(false)
    expect((error as GmailApiError).message).toContain('invalid_grant')
    expect((error as GmailApiError).message).toContain('GMAIL_REFRESH_TOKEN')
  })

  it('401 no envio descarta o access token em cache e é transitório', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(jsonResponse(401, { error: { message: 'Invalid Credentials' } }))
      .mockResolvedValueOnce(jsonResponse(200, { access_token: 'access-2', expires_in: 3600 }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'msg-2' }))

    const error = await sendViaGmailApi(message).catch((e: unknown) => e)
    expect((error as GmailApiError).transient).toBe(true)
    expect((error as GmailApiError).status).toBe(401)

    await expect(sendViaGmailApi(message)).resolves.toBe('msg-2')
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe('Bearer access-2')
  })

  it('400 no envio (ex.: remetente não autorizado) é permanente', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(jsonResponse(400, { error: { message: 'Invalid From header' } }))

    const error = await sendViaGmailApi(message).catch((e: unknown) => e)
    expect((error as GmailApiError).transient).toBe(false)
    expect((error as GmailApiError).message).toContain('Invalid From header')
  })

  it('429/5xx e falhas de rede são transitórios', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(jsonResponse(429, { error: { message: 'Rate limit' } }))
    expect(((await sendViaGmailApi(message).catch((e) => e)) as GmailApiError).transient).toBe(true)

    const networkFailure = new TypeError('fetch failed')
    Object.assign(networkFailure, { cause: new Error('getaddrinfo EAI_AGAIN') })
    fetchMock.mockRejectedValueOnce(networkFailure)
    const networkError = (await sendViaGmailApi(message).catch((e) => e)) as GmailApiError
    expect(networkError.transient).toBe(true)
    expect(networkError.message).toContain('getaddrinfo EAI_AGAIN')
  })
})
