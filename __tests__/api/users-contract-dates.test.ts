/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { GET, PUT } from '@/app/api/users/[id]/route'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    auditLog: { create: jest.fn() },
  },
}))
jest.mock('@/lib/cache', () => ({
  UserCache: { invalidate: jest.fn(), invalidateAll: jest.fn() },
}))

const mockedSession = getServerSession as jest.Mock
const mockedFind = prisma.user.findUnique as jest.Mock
const mockedUpdate = prisma.user.update as jest.Mock
const mockedAudit = prisma.auditLog.create as jest.Mock
const params = { params: Promise.resolve({ id: 'aluno-1' }) }
const endpoint = 'https://example.com/api/users/aluno-1'
const request = (body: Record<string, unknown>) =>
  new NextRequest(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const existing = {
  id: 'aluno-1',
  email: 'aluno@example.com',
  name: 'Aluno Teste',
  role: 'EMPLOYEE',
  contractStartDate: new Date('0026-11-09T00:00:00.000Z'),
  contractEndDate: new Date('0027-04-09T00:00:00.000Z'),
}

describe('edição administrativa da vigência do contrato', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedSession.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    mockedFind.mockResolvedValue(existing)
    mockedUpdate.mockResolvedValue({
      id: 'aluno-1',
      email: existing.email,
      name: existing.name,
      role: existing.role,
      updatedAt: new Date(),
    })
    mockedAudit.mockResolvedValue({})
  })

  it('disponibiliza as datas existentes na consulta de usuário', async () => {
    const response = await GET(new NextRequest(endpoint), params)
    expect(response.status).toBe(200)
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          contractStartDate: true,
          contractEndDate: true,
        }),
      })
    )
  })

  it('não permite gravar 0027-04-09', async () => {
    const response = await PUT(request({ contractEndDate: '0027-04-09' }), params)
    expect(response.status).toBe(400)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('impede que um aluno altere sua própria vigência', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'aluno-1', role: 'EMPLOYEE' } })
    const response = await PUT(
      request({ contractStartDate: '2026-11-09', contractEndDate: '2027-04-09' }),
      params
    )
    expect(response.status).toBe(403)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('corrige as duas datas confirmadas por um administrador', async () => {
    const response = await PUT(
      request({ contractStartDate: '2026-11-09', contractEndDate: '2027-04-09' }),
      params
    )
    expect(response.status).toBe(200)
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contractStartDate: new Date('2026-11-09T00:00:00.000Z'),
          contractEndDate: new Date('2027-04-09T00:00:00.000Z'),
        }),
      })
    )
    expect(mockedAudit).toHaveBeenCalledTimes(1)
  })
})
