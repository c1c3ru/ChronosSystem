/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: jest.fn(), create: jest.fn() } },
}))
jest.mock('@/lib/cache', () => ({
  UserCache: { invalidateAll: jest.fn() },
}))

import { POST } from '@/app/api/users/route'

const session = getServerSession as jest.Mock
const create = prisma.user.create as jest.Mock

const request = (contractEndDate: string) =>
  new NextRequest('https://example.com/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aluno Teste',
      email: 'aluno@example.com',
      password: 'senha-teste-segura',
      role: 'EMPLOYEE',
      phone: '(85) 99999-9999',
      address: 'Rua Teste, 123',
      birthDate: '2005-02-01',
      emergencyContact: 'Responsável',
      emergencyPhone: '(85) 98888-7777',
      department: 'TI',
      registrationNumber: '20261234567',
      startDate: '2026-11-09',
      contractStartDate: '2026-11-09',
      contractEndDate,
      contractType: 'ESTAGIO_20H',
      weeklyHours: 20,
    }),
  })

describe('POST /api/users - ano do contrato', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
  })

  it('rejeita ano 0027 antes de gravar o estagiário', async () => {
    const response = await POST(request('0027-04-09'))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('ano completo')
    expect(create).not.toHaveBeenCalled()
  })
})
