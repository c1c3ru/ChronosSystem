/**
 * @jest-environment node
 *
 * O horário digitado no cadastro era descartado e o sistema gravava sempre o
 * padrão do turno. Agora vale o horário informado pelo aluno.
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    auditLog: { create: jest.fn() },
  },
}))

import { POST } from '@/app/api/auth/complete-profile/route'

const mockedUpdate = prisma.user.update as jest.Mock

const PAYLOAD = {
  phone: '(85) 98888-7777',
  address: 'Rua Teste, 123',
  birthDate: '2000-01-01',
  emergencyContact: 'Mãe Teste',
  emergencyPhone: '(85) 98888-6666',
  department: 'CTI-MAR',
  registrationNumber: '20231234567',
  shift: 'AFTERNOON',
}

const post = (body: Record<string, unknown>) =>
  POST(
    new NextRequest('https://example.com/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )

describe('POST /api/auth/complete-profile - horário do turno', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'u1', role: 'EMPLOYEE' } })
    ;(prisma.user.count as jest.Mock).mockResolvedValue(1)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'a@b.c' })
    mockedUpdate.mockResolvedValue({ id: 'u1', email: 'a@b.c', role: 'EMPLOYEE' })
    ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})
  })

  it('grava o horário digitado pelo aluno', async () => {
    const response = await post({ ...PAYLOAD, shiftStartTime: '14:00', shiftEndTime: '18:00' })
    expect(response.status).toBe(200)
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ shiftStartTime: '14:00', shiftEndTime: '18:00' }),
      })
    )
  })

  it('usa o padrão do turno quando o horário não é enviado', async () => {
    const response = await post(PAYLOAD)
    expect(response.status).toBe(200)
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ shiftStartTime: '13:00', shiftEndTime: '17:00' }),
      })
    )
  })

  it('recusa fim antes do início', async () => {
    const response = await post({ ...PAYLOAD, shiftStartTime: '14:00', shiftEndTime: '13:00' })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.fieldErrors.shiftEndTime).toBeDefined()
    expect(mockedUpdate).not.toHaveBeenCalled()
  })
})
