/**
 * @jest-environment node
 *
 * Ver __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 */
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    cronLog: {
      findMany: jest.fn(),
    },
  },
}))

import { GET } from '@/app/api/admin/cron-logs/route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedFindMany = prisma.cronLog.findMany as jest.Mock

function makeRequest(query = ''): NextRequest {
  return new NextRequest(`https://example.com/api/admin/cron-logs${query}`)
}

describe('GET /api/admin/cron-logs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 403 sem sessão', async () => {
    mockedGetServerSession.mockResolvedValue(null)
    const response = await GET(makeRequest())
    expect(response.status).toBe(403)
    expect(mockedFindMany).not.toHaveBeenCalled()
  })

  it('retorna 403 para role sem permissão (EMPLOYEE)', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { role: 'EMPLOYEE' } })
    const response = await GET(makeRequest())
    expect(response.status).toBe(403)
    expect(mockedFindMany).not.toHaveBeenCalled()
  })

  it.each(['ADMIN', 'SUPERVISOR'])(
    'retorna os logs mais recentes para role %s, parseando o JSON de falhas',
    async (role) => {
      mockedGetServerSession.mockResolvedValue({ user: { role } })
      mockedFindMany.mockResolvedValue([
        {
          id: 'log-1',
          jobName: 'daily-justification-check',
          status: 'PARTIAL_FAILURE',
          startedAt: new Date('2026-09-03T12:00:00.000Z'),
          finishedAt: new Date('2026-09-03T12:00:05.000Z'),
          totalCount: 2,
          successCount: 1,
          failureCount: 1,
          errors: JSON.stringify([{ email: 'a@example.com', message: 'boom' }]),
          errorMessage: null,
        },
      ])

      const response = await GET(makeRequest())
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.logs).toHaveLength(1)
      expect(body.logs[0].failures).toEqual([{ email: 'a@example.com', message: 'boom' }])
      expect(mockedFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { startedAt: 'desc' }, take: 20 })
      )
    }
  )

  it('nunca deixa um campo errors malformado quebrar a resposta', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { role: 'ADMIN' } })
    mockedFindMany.mockResolvedValue([
      {
        id: 'log-1',
        jobName: 'attendance-reminder',
        status: 'ERROR',
        startedAt: new Date(),
        finishedAt: null,
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        errors: '{not valid json',
        errorMessage: 'DB indisponível',
      },
    ])

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.logs[0].failures).toEqual([])
  })

  it('respeita o parâmetro limit, com teto de 100 e fallback para 20 se inválido', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { role: 'ADMIN' } })
    mockedFindMany.mockResolvedValue([])

    await GET(makeRequest('?limit=500'))
    expect(mockedFindMany).toHaveBeenLastCalledWith(expect.objectContaining({ take: 100 }))

    await GET(makeRequest('?limit=abc'))
    expect(mockedFindMany).toHaveBeenLastCalledWith(expect.objectContaining({ take: 20 }))
  })
})
