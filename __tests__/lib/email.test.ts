/**
 * Retry com backoff em EmailService.sendEmail para falhas transitórias de
 * rede/DNS na conexão SMTP (ex.: "getaddrinfo EBUSY smtp.gmail.com"),
 * comuns em rajadas de envio concorrente num ambiente serverless.
 */
jest.mock('@/lib/mailer', () => ({
  mailerTransport: { sendMail: jest.fn() },
  MAIL_FROM: 'Chronos <noreply@example.com>',
  isSmtpConfigured: jest.fn(() => true),
}))

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

import { mailerTransport, isSmtpConfigured } from '@/lib/mailer'
import { emailService } from '@/lib/email'

const mockedSendMail = mailerTransport.sendMail as jest.Mock
const mockedIsSmtpConfigured = isSmtpConfigured as jest.Mock

function errnoError(message: string, code?: string): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException
  if (code) error.code = code
  return error
}

describe('emailService.sendEmail (retry para falhas transitórias)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsSmtpConfigured.mockReturnValue(true)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('retorna false sem tentar enviar quando SMTP não está configurado', async () => {
    mockedIsSmtpConfigured.mockReturnValue(false)

    const result = await emailService.sendAttendanceNotificationEmail(
      'user@example.com',
      'Assunto',
      '<p>html</p>'
    )

    expect(result).toBe(false)
    expect(mockedSendMail).not.toHaveBeenCalled()
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
