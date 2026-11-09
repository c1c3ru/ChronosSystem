/**
 * Retry com backoff em EmailService.sendEmail para falhas transitórias de
 * rede/DNS na conexão SMTP (ex.: "getaddrinfo EBUSY smtp.gmail.com"),
 * comuns em rajadas de envio concorrente num ambiente serverless.
 */
jest.mock('@/lib/mailer', () => ({
  mailerTransport: { sendMail: jest.fn() },
  MAIL_FROM: 'Chronos <noreply@example.com>',
  getMailProvider: jest.fn(() => 'smtp'),
}))

jest.mock('@/lib/env', () => ({ env: {} }))

jest.mock('@/lib/gmail-api', () => {
  const actual = jest.requireActual('@/lib/gmail-api')
  return { ...actual, sendViaGmailApi: jest.fn() }
})

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

import { mailerTransport, getMailProvider } from '@/lib/mailer'
import { GmailApiError, sendViaGmailApi } from '@/lib/gmail-api'
import { emailService } from '@/lib/email'

const mockedSendMail = mailerTransport.sendMail as jest.Mock
const mockedGetMailProvider = getMailProvider as jest.Mock
const mockedSendViaGmailApi = sendViaGmailApi as jest.Mock

function errnoError(message: string, code?: string): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException
  if (code) error.code = code
  return error
}

describe('emailService.sendEmail (retry para falhas transitórias)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetMailProvider.mockReturnValue('smtp')
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('retorna false sem tentar enviar quando nenhum provedor está configurado', async () => {
    mockedGetMailProvider.mockReturnValue(null)

    const result = await emailService.sendAttendanceNotificationEmail(
      'user@example.com',
      'Assunto',
      '<p>html</p>'
    )

    expect(result).toBe(false)
    expect(mockedSendMail).not.toHaveBeenCalled()
    expect(mockedSendViaGmailApi).not.toHaveBeenCalled()
  })

  it('não tenta de novo quando o envio funciona de primeira', async () => {
    mockedSendMail.mockResolvedValueOnce({ messageId: 'id-1' })

    const result = await emailService.sendAttendanceNotificationEmail(
      'user@example.com',
      'Assunto',
      '<p>html</p>'
    )

    expect(result).toBe(true)
    expect(mockedSendMail).toHaveBeenCalledTimes(1)
  })

  it('tenta de novo após um erro transitório (getaddrinfo EBUSY) e entrega na 2ª tentativa', async () => {
    mockedSendMail
      .mockRejectedValueOnce(errnoError('getaddrinfo EBUSY smtp.gmail.com', 'ESOCKET'))
      .mockResolvedValueOnce({ messageId: 'id-2' })

    // O `expect` precisa ser anexado à Promise antes de avançar os timers do
    // retry — senão ela pode resolver/rejeitar antes de ter um handler, e o
    // Jest acusa unhandled rejection mesmo quando o teste "passaria".
    const promise = emailService.sendAttendanceNotificationEmail(
      'user@example.com',
      'Assunto',
      '<p>html</p>'
    )
    const assertion = expect(promise).resolves.toBe(true)
    await jest.advanceTimersByTimeAsync(10_000)
    await assertion

    expect(mockedSendMail).toHaveBeenCalledTimes(2)
  })

  it('esgota as tentativas e propaga o erro quando a falha transitória persiste', async () => {
    mockedSendMail.mockRejectedValue(errnoError('getaddrinfo EBUSY smtp.gmail.com', 'ESOCKET'))

    const promise = emailService.sendAttendanceNotificationEmail(
      'user@example.com',
      'Assunto',
      '<p>html</p>'
    )
    const assertion = expect(promise).rejects.toThrow('getaddrinfo EBUSY smtp.gmail.com')
    await jest.advanceTimersByTimeAsync(10_000)
    await assertion

    expect(mockedSendMail).toHaveBeenCalledTimes(3)
  })

  it('não tenta de novo em falha permanente (credenciais inválidas)', async () => {
    mockedSendMail.mockRejectedValue(errnoError('Invalid login', 'EAUTH'))

    await expect(
      emailService.sendAttendanceNotificationEmail('user@example.com', 'Assunto', '<p>html</p>')
    ).rejects.toThrow('Invalid login')

    expect(mockedSendMail).toHaveBeenCalledTimes(1)
  })
})

describe('emailService.sendEmail via Gmail API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetMailProvider.mockReturnValue('gmail-api')
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('envia pela API do Gmail (e não pelo SMTP) quando ela está configurada', async () => {
    mockedSendViaGmailApi.mockResolvedValueOnce('gmail-id-1')

    const result = await emailService.sendAttendanceNotificationEmail(
      'aluno@example.com',
      'Assunto',
      '<p>html</p>'
    )

    expect(result).toBe(true)
    expect(mockedSendMail).not.toHaveBeenCalled()
    expect(mockedSendViaGmailApi).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Chronos <noreply@example.com>',
        to: 'aluno@example.com',
        subject: 'Assunto',
        html: '<p>html</p>',
      })
    )
  })

  it('tenta de novo em erro transitório da API (ex.: 503) e entrega na 2ª tentativa', async () => {
    mockedSendViaGmailApi
      .mockRejectedValueOnce(new GmailApiError('Gmail API recusou o envio (HTTP 503)', true, 503))
      .mockResolvedValueOnce('gmail-id-2')

    const promise = emailService.sendAttendanceNotificationEmail(
      'aluno@example.com',
      'Assunto',
      '<p>html</p>'
    )
    const assertion = expect(promise).resolves.toBe(true)
    await jest.advanceTimersByTimeAsync(10_000)
    await assertion

    expect(mockedSendViaGmailApi).toHaveBeenCalledTimes(2)
  })

  it('não tenta de novo em erro permanente (refresh token revogado) e informa o motivo', async () => {
    mockedSendViaGmailApi.mockRejectedValue(
      new GmailApiError('Falha ao obter access token do Google (HTTP 400: invalid_grant)', false)
    )

    await expect(
      emailService.sendAttendanceNotificationEmail('aluno@example.com', 'Assunto', '<p>html</p>')
    ).rejects.toThrow('Falha ao enviar email via Gmail API: Falha ao obter access token')

    expect(mockedSendViaGmailApi).toHaveBeenCalledTimes(1)
  })
})
