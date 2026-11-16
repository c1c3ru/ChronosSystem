/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { POST } from '@/app/api/contracts/expiring/route'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { update: jest.fn() }, auditLog: { create: jest.fn() } },
}))

const mockedSession = getServerSession as jest.Mock

describe('POST /api/contracts/expiring - renovação', () => {
  it('recusa anos incompletos antes de modificar o contrato', async () => {
    mockedSession.mockResolvedValue({
      user: { id: 'admin', role: 'ADMIN' },
    })
    const response = await POST(
      new NextRequest('https://example.com/api/contracts/expiring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'aluno-1', newEndDate: '0027-04-09' }),
      })
    )

    expect(response.status).toBe(400)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})
