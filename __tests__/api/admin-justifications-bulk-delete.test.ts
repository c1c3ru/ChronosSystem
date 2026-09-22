/**
 * @jest-environment node
 *
 * Ver __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 */
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { DELETE_ALL_CONFIRMATION } from '@/lib/justification-bulk'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    justification: {
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

import { DELETE } from '@/app/api/admin/justifications/bulk/route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedDeleteMany = prisma.justification.deleteMany as jest.Mock
const mockedAuditCreate = prisma.auditLog.create as jest.Mock

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('https://example.com/api/admin/justifications/bulk', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const admin = { user: { id: 'admin-1', name: 'Admin', role: 'ADMIN' } }
const supervisor = { user: { id: 'sup-1', name: 'Supervisor', role: 'SUPERVISOR' } }

describe('DELETE /api/admin/justifications/bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDeleteMany.mockResolvedValue({ count: 3 })
    mockedAuditCreate.mockResolvedValue({})
  })

  it('recusa a exclusão total para SUPERVISOR', async () => {
    mockedGetServerSession.mockResolvedValue(supervisor)

    const response = await DELETE(
      makeRequest({ deleteAll: true, confirmation: DELETE_ALL_CONFIRMATION })
    )

    expect(response.status).toBe(403)
    expect(mockedDeleteMany).not.toHaveBeenCalled()
  })

  it('recusa a exclusão total sem a frase de confirmação', async () => {
    mockedGetServerSession.mockResolvedValue(admin)

    const response = await DELETE(makeRequest({ deleteAll: true }))

    expect(response.status).toBe(400)
    expect(mockedDeleteMany).not.toHaveBeenCalled()
  })

  it('recusa a exclusão total com frase de confirmação errada', async () => {
    mockedGetServerSession.mockResolvedValue(admin)

    const response = await DELETE(makeRequest({ deleteAll: true, confirmation: 'excluir tudo' }))

    expect(response.status).toBe(400)
    expect(mockedDeleteMany).not.toHaveBeenCalled()
  })

  it('executa a exclusão total para ADMIN com a frase correta', async () => {
    mockedGetServerSession.mockResolvedValue(admin)

    const response = await DELETE(
      makeRequest({ deleteAll: true, confirmation: DELETE_ALL_CONFIRMATION })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true, deletedCount: 3 })
    expect(mockedDeleteMany).toHaveBeenCalledWith({})
    expect(mockedAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'DELETE_ALL_JUSTIFICATIONS' }),
      })
    )
  })

  it('continua permitindo que SUPERVISOR exclua justificativas selecionadas', async () => {
    mockedGetServerSession.mockResolvedValue(supervisor)

    const response = await DELETE(makeRequest({ justificationIds: ['j1', 'j2', 'j3'] }))

    expect(response.status).toBe(200)
    expect(mockedDeleteMany).toHaveBeenCalledWith({ where: { id: { in: ['j1', 'j2', 'j3'] } } })
  })

  it('recusa quem não é ADMIN nem SUPERVISOR', async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: 'e1', role: 'EMPLOYEE' } })

    const response = await DELETE(makeRequest({ justificationIds: ['j1'] }))

    expect(response.status).toBe(401)
    expect(mockedDeleteMany).not.toHaveBeenCalled()
  })
})
