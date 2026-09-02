/**
 * @jest-environment node
 *
 * Route Handler roda em runtime de servidor. Ver
 * __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}))

import { GET } from '@/app/api/cron/daily-justification-check/route'

const ENDPOINT = 'https://example.com/api/cron/daily-justification-check'
const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET
const mockedFindMany = prisma.user.findMany as jest.Mock

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
