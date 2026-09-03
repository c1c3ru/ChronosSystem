/**
 * @jest-environment node
 *
 * Route Handler roda em runtime de servidor. Ver
 * __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
    attendanceRecord: {
      findMany: jest.fn(),
    },
    justification: {
      findMany: jest.fn(),
    },
    holiday: {
      findMany: jest.fn(),
    },
    attendanceNotification: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    cronLog: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email', () => ({
  emailService: {
    sendJustificationRequiredEmail: jest.fn(),
  },
}))

import { GET } from '@/app/api/cron/daily-justification-check/route'

const ENDPOINT = 'https://example.com/api/cron/daily-justification-check'
const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET
const mockedFindMany = prisma.user.findMany as jest.Mock
const mockedAttendanceRecordFindMany = prisma.attendanceRecord.findMany as jest.Mock
const mockedJustificationFindMany = prisma.justification.findMany as jest.Mock
const mockedHolidayFindMany = prisma.holiday.findMany as jest.Mock
const mockedNotificationFindMany = prisma.attendanceNotification.findMany as jest.Mock
const mockedNotificationCreate = prisma.attendanceNotification.create as jest.Mock
const mockedCronLogCreate = prisma.cronLog.create as jest.Mock
const mockedSendJustificationEmail = emailService.sendJustificationRequiredEmail as jest.Mock

function makeRequest(authHeader?: string): NextRequest {
  const headers = new Headers()
  if (authHeader !== undefined) {
    headers.set('authorization', authHeader)
  }
  return new NextRequest(ENDPOINT, { headers })
}

describe('GET /api/cron/daily-justification-check - autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    if (ORIGINAL_CRON_SECRET === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = ORIGINAL_CRON_SECRET
    }
  })

  it('retorna 200 quando o header Authorization traz "Bearer <CRON_SECRET correto>"', async () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'
    mockedFindMany.mockResolvedValue([])

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('retorna 401 "Não autorizado" quando a secret enviada está errada', async () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'

    const response = await GET(makeRequest('Bearer SECRET_ERRADA'))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Não autorizado')
    expect(mockedFindMany).not.toHaveBeenCalled()
  })

  it('retorna 401 "Não autorizado" quando não há header Authorization', async () => {
    process.env.CRON_SECRET = 'SECRET_CERTA'

    const response = await GET(makeRequest(undefined))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Não autorizado')
    expect(mockedFindMany).not.toHaveBeenCalled()
  })

  it('retorna 500 (erro de configuração) quando CRON_SECRET não está definido no servidor', async () => {
    delete process.env.CRON_SECRET

    const response = await GET(makeRequest('Bearer QUALQUER_COISA'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toMatch(/CRON_SECRET/)
    expect(mockedFindMany).not.toHaveBeenCalled()
  })

  it('retorna 500 (erro de configuração) quando CRON_SECRET é uma string vazia no servidor', async () => {
    process.env.CRON_SECRET = ''

    const response = await GET(makeRequest('Bearer QUALQUER_COISA'))

    expect(response.status).toBe(500)
    expect(mockedFindMany).not.toHaveBeenCalled()
  })
})

describe('GET /api/cron/daily-justification-check - envio de lembretes', () => {
  function employee(id: string, email: string) {
    return { id, name: `Estagiário ${id}`, email }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'SECRET_CERTA'

    // Sem nenhum registro de ponto no período -> todo dia útil dos últimos
    // 30 dias vira uma falta pendente, para qualquer estagiário retornado
    // por user.findMany. Não precisa mockar a lógica de negócio em si
    // (analyzeDayForJustification/isWeekend) — a real, dada essa entrada,
    // já produz pendências de forma determinística.
    mockedAttendanceRecordFindMany.mockResolvedValue([])
    mockedJustificationFindMany.mockResolvedValue([])
    mockedHolidayFindMany.mockResolvedValue([])
    mockedNotificationFindMany.mockResolvedValue([])
    mockedNotificationCreate.mockResolvedValue({})
    mockedCronLogCreate.mockResolvedValue({})
  })

  afterEach(() => {
    if (ORIGINAL_CRON_SECRET === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = ORIGINAL_CRON_SECRET
    }
  })

  it('retorna 200 e status SUCCESS quando todos os lembretes são enviados', async () => {
    mockedFindMany.mockResolvedValue([employee('u1', 'a@example.com'), employee('u2', 'b@example.com')])
    mockedSendJustificationEmail.mockResolvedValue(true)

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.results.sent).toBe(2)
    expect(body.results.failed).toBe(0)
    expect(mockedCronLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ jobName: 'daily-justification-check', status: 'SUCCESS' }),
    })
  })

  it('critério de sucesso 1: uma falha simulada de e-mail não impede o envio dos demais, e retorna 207 (não 500)', async () => {
    mockedFindMany.mockResolvedValue([
      employee('u1', 'falha@example.com'),
      employee('u2', 'sucesso@example.com'),
    ])
    mockedSendJustificationEmail.mockImplementation(async (to: string) => {
      if (to === 'falha@example.com') {
        throw new Error('Invalid login: 535 authentication failed')
      }
      return true
    })

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    // O item que falhou não impediu o envio do item seguinte no lote.
    expect(mockedSendJustificationEmail).toHaveBeenCalledTimes(2)
    expect(response.status).toBe(207)
    expect(body.success).toBe(false)
    expect(body.results.sent).toBe(1)
    expect(body.results.failed).toBe(1)

    const failedDetail = body.results.details.find((d: { email: string }) => d.email === 'falha@example.com')
    expect(failedDetail.status).toBe('failed')
    // A mensagem real do erro chega até a resposta — não mais o genérico
    // "Erro ao enviar email" que escondia a causa.
    expect(failedDetail.message).toContain('Invalid login')

    expect(mockedCronLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobName: 'daily-justification-check',
        status: 'PARTIAL_FAILURE',
        successCount: 1,
        failureCount: 1,
      }),
    })
  })

  it('retorna 207 (não 500) mesmo quando 100% dos e-mails falham — não é uma falha de API', async () => {
    mockedFindMany.mockResolvedValue([employee('u1', 'a@example.com')])
    mockedSendJustificationEmail.mockRejectedValue(new Error('ECONNREFUSED'))

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(207)
    expect(body.results.sent).toBe(0)
    expect(body.results.failed).toBe(1)
  })

  it('retorna 500 e grava CronLog com status ERROR quando o job quebra antes de terminar', async () => {
    mockedFindMany.mockRejectedValue(new Error('Conexão com o banco perdida'))

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(mockedSendJustificationEmail).not.toHaveBeenCalled()
    expect(mockedCronLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobName: 'daily-justification-check',
        status: 'ERROR',
        errorMessage: 'Conexão com o banco perdida',
      }),
    })
  })
})
