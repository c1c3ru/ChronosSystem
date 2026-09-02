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
    formDraft: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

import { POST } from '@/app/api/admin/students/backfill-registration-number/route'

const ENDPOINT = 'https://example.com/api/admin/students/backfill-registration-number'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedDraftFindMany = prisma.formDraft.findMany as jest.Mock
const mockedUserFindMany = prisma.user.findMany as jest.Mock
const mockedUserUpdate = prisma.user.update as jest.Mock
const mockedAuditCreate = prisma.auditLog.create as jest.Mock

function makeRequest(query = ''): NextRequest {
  return new NextRequest(`${ENDPOINT}${query}`, { method: 'POST' })
}

function mockDraftsAndUsers() {
  mockedDraftFindMany.mockResolvedValue([
    {
      userId: 'user-a',
      formType: 'internship-registration',
      formData: JSON.stringify({ student_enrollment: '111' }),
      updatedAt: new Date('2026-06-01'),
    },
    {
      userId: 'user-b',
      formType: 'monthly-report',
      formData: JSON.stringify({ student_enrollment: '222' }),
      updatedAt: new Date('2026-05-01'),
    },
  ])
  mockedUserFindMany.mockResolvedValue([
    { id: 'user-a', email: 'a@aluno.ifce.edu.br', registrationNumber: null },
    { id: 'user-b', email: 'b@aluno.ifce.edu.br', registrationNumber: '999' },
  ])
}

describe('POST /api/admin/students/backfill-registration-number', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 401 quando não há usuário autenticado', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const response = await POST(makeRequest())

    expect(response.status).toBe(401)
    expect(mockedDraftFindMany).not.toHaveBeenCalled()
  })

  it('retorna 403 quando o usuário autenticado não é ADMIN (SUPERVISOR incluso)', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'sup-1', email: 'sup@example.com', role: 'SUPERVISOR' },
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toContain('administradores')
    expect(mockedDraftFindMany).not.toHaveBeenCalled()
  })

  it('em modo dry-run, retorna a contagem sem gravar nada nem auditar', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    })
    mockDraftsAndUsers()

    const response = await POST(makeRequest('?dryRun=true'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      dryRun: true,
      totalDrafts: 2,
      candidateCount: 2,
      updated: 1,
      skippedAlreadySet: 1,
    })
    expect(mockedUserUpdate).not.toHaveBeenCalled()
    expect(mockedAuditCreate).not.toHaveBeenCalled()
  })

  it('aplica de fato, atualiza só quem está sem matrícula e registra auditoria', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    })
    mockDraftsAndUsers()
    mockedUserUpdate.mockResolvedValue({})
    mockedAuditCreate.mockResolvedValue({})

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      dryRun: false,
      totalDrafts: 2,
      candidateCount: 2,
      updated: 1,
      skippedAlreadySet: 1,
    })

    expect(mockedUserUpdate).toHaveBeenCalledTimes(1)
    expect(mockedUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-a' },
      data: { registrationNumber: '111' },
    })

    expect(mockedAuditCreate).toHaveBeenCalledTimes(1)
    expect(mockedAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'STUDENTS_REGISTRATION_NUMBER_BACKFILLED',
          userId: 'admin-1',
        }),
      })
    )
  })

  it('não registra auditoria quando não há nada para atualizar', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    })
    mockedDraftFindMany.mockResolvedValue([])
    mockedUserFindMany.mockResolvedValue([])

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.updated).toBe(0)
    expect(mockedUserUpdate).not.toHaveBeenCalled()
    expect(mockedAuditCreate).not.toHaveBeenCalled()
  })

  it('retorna 500 quando ocorre um erro inesperado', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    })
    mockedDraftFindMany.mockRejectedValue(new Error('Falha de conexão'))

    const response = await POST(makeRequest())

    expect(response.status).toBe(500)
  })
})
