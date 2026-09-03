/**
 * @jest-environment node
 *
 * Route Handler roda em runtime de servidor — ver
 * __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 *
 * A lógica de decisão de quem precisa de notificação (checkAndNotifyAttendance)
 * já é coberta em __tests__/lib/notifications.test.ts, incluindo o critério
 * de isolamento de falha via Promise.allSettled. Aqui o foco é só o
 * mapeamento status -> HTTP status/CronLog desta rota, espelhando o mesmo
 * contrato de app/api/cron/daily-justification-check.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAndNotifyAttendance } from '@/lib/notifications'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    cronLog: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/notifications', () => ({
  checkAndNotifyAttendance: jest.fn(),
}))

import { GET } from '@/app/api/notifications/cron/route'

const ENDPOINT = 'https://example.com/api/notifications/cron'
const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET
const mockedCheckAndNotify = checkAndNotifyAttendance as jest.Mock
const mockedCronLogCreate = prisma.cronLog.create as jest.Mock

function makeRequest(authHeader?: string): NextRequest {
  const headers = new Headers()
  if (authHeader !== undefined) {
    headers.set('authorization', authHeader)
  }
  return new NextRequest(ENDPOINT, { headers })
}

describe('GET /api/notifications/cron', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'SECRET_CERTA'
    mockedCronLogCreate.mockResolvedValue({})
  })

  afterEach(() => {
    if (ORIGINAL_CRON_SECRET === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = ORIGINAL_CRON_SECRET
    }
  })

  it('retorna 401 sem CRON_SECRET correto', async () => {
    const response = await GET(makeRequest('Bearer errado'))
    expect(response.status).toBe(401)
    expect(mockedCheckAndNotify).not.toHaveBeenCalled()
  })

  it('retorna 200 quando o resumo é SUCCESS', async () => {
    mockedCheckAndNotify.mockResolvedValue({
      status: 'SUCCESS',
      totalCount: 2,
      successCount: 2,
      failureCount: 0,
      failures: [],
    })

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockedCronLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ jobName: 'attendance-reminder', status: 'SUCCESS' }),
    })
  })

  it('retorna 207 (não 500) quando o resumo é PARTIAL_FAILURE', async () => {
    mockedCheckAndNotify.mockResolvedValue({
      status: 'PARTIAL_FAILURE',
      totalCount: 2,
      successCount: 1,
      failureCount: 1,
      failures: [{ email: 'a@example.com', message: 'SMTP indisponível' }],
    })

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(207)
    expect(body.success).toBe(false)
    expect(body.results.failureCount).toBe(1)
    expect(mockedCronLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ jobName: 'attendance-reminder', status: 'PARTIAL_FAILURE' }),
    })
  })

  it('retorna 500 e grava CronLog ERROR quando checkAndNotifyAttendance rejeita', async () => {
    mockedCheckAndNotify.mockRejectedValue(new Error('Falha inesperada'))

    const response = await GET(makeRequest('Bearer SECRET_CERTA'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(mockedCronLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobName: 'attendance-reminder',
        status: 'ERROR',
        errorMessage: 'Falha inesperada',
      }),
    })
  })
})
