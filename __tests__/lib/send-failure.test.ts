import { explainSendFailure, countFailureKinds } from '@/lib/send-failure'
import { TIME_BUDGET_EXCEEDED_MESSAGE, EMAIL_NOT_CONFIGURED_MESSAGE } from '@/lib/cron-log'

jest.mock('@/lib/prisma', () => ({ prisma: {} }))

/**
 * Mensagens reais vistas no histórico de CronLog/GitHub Actions viram uma
 * explicação em português, com o que fazer — e adiamentos não contam como erro.
 */
describe('explainSendFailure', () => {
  it.each([
    [TIME_BUDGET_EXCEEDED_MESSAGE, 'DEFERRED'],
    [EMAIL_NOT_CONFIGURED_MESSAGE, 'NOT_CONFIGURED'],
    ['Falha no envio', 'NOT_CONFIGURED'],
    ['Erro ao enviar email', 'NOT_CONFIGURED'],
    ['Falha ao enviar email via SMTP: getaddrinfo EBUSY smtp.gmail.com\n', 'NETWORK'],
    ['Falha ao enviar email via SMTP: getaddrinfo ENOTFOUND smtp.gmail.com', 'NETWORK'],
    ['Falha ao enviar email via SMTP: connect ECONNREFUSED 1.2.3.4:587', 'NETWORK'],
    [
      'Falha ao enviar email via SMTP: Invalid login: 535-5.7.8 Username and Password not accepted',
      'AUTH',
    ],
    [
      'Falha ao enviar email via Gmail API: Falha ao obter access token do Google (HTTP 400: invalid_grant)',
      'AUTH',
    ],
    ['Falha ao enviar email via SMTP: 550 5.1.1 Recipient address rejected', 'RECIPIENT'],
    ['Falha ao enviar email via SMTP: 550-5.4.5 Daily user sending limit exceeded', 'QUOTA'],
    ['Envio excedeu o tempo limite de 12000ms', 'TIMEOUT'],
    ['Falha ao enviar email via SMTP: Greeting never received (ETIMEDOUT)', 'TIMEOUT'],
    ['algo totalmente diferente', 'UNKNOWN'],
  ])('%s → %s', (message, kind) => {
    const explanation = explainSendFailure(message)
    expect(explanation.kind).toBe(kind)
    expect(explanation.deferred).toBe(kind === 'DEFERRED')
    expect(explanation.title).not.toHaveLength(0)
    expect(explanation.hint).not.toHaveLength(0)
  })

  it('separa adiados de falhas reais', () => {
    expect(
      countFailureKinds([
        { message: TIME_BUDGET_EXCEEDED_MESSAGE },
        { message: TIME_BUDGET_EXCEEDED_MESSAGE },
        { message: 'getaddrinfo EBUSY smtp.gmail.com' },
      ])
    ).toEqual({ deferred: 2, failed: 1 })
  })
})
