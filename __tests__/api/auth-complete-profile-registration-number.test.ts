/**
 * @jest-environment node
 *
 * Route Handlers do App Router rodam em runtime de servidor. Ver
 * __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

import { POST } from '@/app/api/auth/complete-profile/route'

const ENDPOINT = 'https://example.com/api/auth/complete-profile'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedUserCount = prisma.user.count as jest.Mock
const mockedUserFindUnique = prisma.user.findUnique as jest.Mock
const mockedUserUpdate = prisma.user.update as jest.Mock
const mockedAuditCreate = prisma.auditLog.create as jest.Mock

const BASE_PAYLOAD = {
  phone: '(85) 98888-7777',
  address: 'Rua Teste, 123',
  birthDate: '2000-01-01',
  emergencyContact: 'Mãe Teste',
  emergencyPhone: '(85) 98888-6666',
  department: 'Alunos',
}

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/complete-profile - matrícula obrigatória para alunos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'aluno@aluno.ifce.edu.br', role: 'EMPLOYEE' },
    })
    mockedUserCount.mockResolvedValue(1)
    mockedUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'aluno@aluno.ifce.edu.br',
      name: 'Aluno Teste',
    })
    mockedUserUpdate.mockResolvedValue({ id: 'user-1', email: 'aluno@aluno.ifce.edu.br', role: 'EMPLOYEE' })
    mockedAuditCreate.mockResolvedValue({})
  })

  it('retorna 400 quando a matrícula não é enviada', async () => {
    const response = await POST(makeRequest(BASE_PAYLOAD))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('Matrícula')
    expect(mockedUserUpdate).not.toHaveBeenCalled()
  })

  it('retorna 400 quando a matrícula é só espaços em branco', async () => {
    const response = await POST(makeRequest({ ...BASE_PAYLOAD, registrationNumber: '   ' }))

    expect(response.status).toBe(400)
    expect(mockedUserUpdate).not.toHaveBeenCalled()
  })

  it('completa o perfil com sucesso quando a matrícula é enviada', async () => {
    const response = await POST(
      makeRequest({ ...BASE_PAYLOAD, registrationNumber: '20231234567' })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)

    expect(mockedUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ registrationNumber: '20231234567' }),
      })
    )
  })
})
