import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { getNowInFortaleza } from '@/lib/timezone'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: jest.fn() },
    attendanceNotification: { create: jest.fn() },
  },
}))

jest.mock('@/lib/email', () => ({
  emailService: {
    sendAttendanceNotificationEmail: jest.fn(),
  },
}))

jest.mock('@/lib/push', () => ({
  sendPushToUser: jest.fn().mockResolvedValue(0),
}))

jest.mock('@/lib/timezone', () => ({
  getNowInFortaleza: jest.fn(),
}))

import { checkAndNotifyAttendance } from '@/lib/notifications'

const mockedFindMany = prisma.user.findMany as jest.Mock
const mockedNotificationCreate = prisma.attendanceNotification.create as jest.Mock
const mockedSendEmail = emailService.sendAttendanceNotificationEmail as jest.Mock
const mockedNow = getNowInFortaleza as jest.Mock

function internNeedingMissedEntry(id: string, email: string) {
  return {
    id,
    name: `Estagiário ${id}`,
    email,
    shiftStartTime: '08:00',
    shiftEndTime: '12:00',
    attendanceRecords: [],
    attendanceNotifications: [],
  }
}

describe('lib/notifications - checkAndNotifyAttendance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 08:05 — 5 min depois do início do turno, sem entrada registrada -> MISSED_ENTRY
    mockedNow.mockReturnValue(new Date('2026-09-03T08:05:00'))
    mockedNotificationCreate.mockResolvedValue({})
  })

  it('uma falha de envio isolada não impede o processamento dos demais estagiários', async () => {
    mockedFindMany.mockResolvedValue([
      internNeedingMissedEntry('u1', 'falha@example.com'),
      internNeedingMissedEntry('u2', 'sucesso@example.com'),
    ])

    mockedSendEmail.mockImplementation(async (to: string) => {
      if (to === 'falha@example.com') {
        throw new Error('SMTP indisponível')
      }
      return true
    })

    const summary = await checkAndNotifyAttendance()

    // Critério de sucesso 1: a falha simulada em um item não impede o envio
    // dos itens subsequentes — os 2 e-mails foram tentados.
    expect(mockedSendEmail).toHaveBeenCalledTimes(2)
    expect(summary.status).toBe('PARTIAL_FAILURE')
    expect(summary.totalCount).toBe(2)
    expect(summary.successCount).toBe(1)
    expect(summary.failureCount).toBe(1)
    expect(summary.failures).toEqual([{ email: 'falha@example.com', message: 'SMTP indisponível' }])

    // Só o estagiário cujo e-mail foi entregue gera o registro de dedup.
    expect(mockedNotificationCreate).toHaveBeenCalledTimes(1)
    expect(mockedNotificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'u2', type: 'MISSED_ENTRY' }),
      })
    )
  })

  it('retorna SUCCESS quando todos os envios dão certo', async () => {
    mockedFindMany.mockResolvedValue([internNeedingMissedEntry('u1', 'ok@example.com')])
    mockedSendEmail.mockResolvedValue(true)

    const summary = await checkAndNotifyAttendance()

    expect(summary).toEqual({
      status: 'SUCCESS',
      totalCount: 1,
      successCount: 1,
      failureCount: 0,
      failures: [],
    })
  })

  // Regressão: o cron é chamado por um `curl --max-time 30` no GitHub Actions
  // (.github/workflows/attendance-reminder-cron.yml). Sem limite de tempo, um
  // único e-mail pendurado segurava o lote inteiro e o job morria com exit 28
  // sem nunca receber resposta.
  it('responde mesmo com um envio pendurado, marcando só ele como falha', async () => {
    mockedFindMany.mockResolvedValue([
      internNeedingMissedEntry('u1', 'pendurado@example.com'),
      internNeedingMissedEntry('u2', 'sucesso@example.com'),
    ])

    mockedSendEmail.mockImplementation(async (to: string) => {
      // Conexão SMTP que nunca responde — o caso real do timeout.
      if (to === 'pendurado@example.com') return new Promise(() => {})
      return true
    })

    const summary = await checkAndNotifyAttendance({ sendTimeoutMs: 20 })

    expect(summary.status).toBe('PARTIAL_FAILURE')
    expect(summary.successCount).toBe(1)
    expect(summary.failures).toHaveLength(1)
    expect(summary.failures[0].email).toBe('pendurado@example.com')
    expect(summary.failures[0].message).toMatch(/tempo limite/)
  })

  it('não envia nada e devolve o lote para o próximo ciclo quando o orçamento de tempo já estourou', async () => {
    mockedFindMany.mockResolvedValue([internNeedingMissedEntry('u1', 'adiado@example.com')])
    mockedSendEmail.mockResolvedValue(true)

    const summary = await checkAndNotifyAttendance({
      startedAt: Date.now() - 60_000,
      timeBudgetMs: 8_000,
    })

    expect(mockedSendEmail).not.toHaveBeenCalled()
    expect(summary.status).toBe('PARTIAL_FAILURE')
    expect(summary.failures[0].message).toMatch(/Orçamento de tempo excedido/)
  })

  it('retorna SUCCESS (sem tentar enviar nada) quando nenhum estagiário precisa de notificação', async () => {
    mockedFindMany.mockResolvedValue([])

    const summary = await checkAndNotifyAttendance()

    expect(summary).toEqual({
      status: 'SUCCESS',
      totalCount: 0,
      successCount: 0,
      failureCount: 0,
      failures: [],
    })
    expect(mockedSendEmail).not.toHaveBeenCalled()
  })
})
