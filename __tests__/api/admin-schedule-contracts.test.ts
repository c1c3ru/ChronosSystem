/**
 * @jest-environment node
 */
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findMany: jest.fn() } },
}))

import { GET } from '@/app/api/admin/schedule/route'

const mockedSession = getServerSession as jest.Mock
const mockedFindMany = prisma.user.findMany as jest.Mock

describe('GET /api/admin/schedule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('não revela horários para usuário sem permissão', async () => {
    mockedSession.mockResolvedValue(null)
    expect((await GET()).status).toBe(401)
    expect(mockedFindMany).not.toHaveBeenCalled()
  })

  it.each(['ADMIN', 'SUPERVISOR'])(
    'retorna somente alunos ativos e as datas do contrato para %s',
    async (role) => {
      mockedSession.mockResolvedValue({ user: { id: 'admin', role } })
      mockedFindMany.mockResolvedValue([
        {
          id: 'active-1',
          name: 'Aluna Ativa',
          email: 'aluna@example.com',
          department: 'TI',
          shiftStartTime: '08:00',
          shiftEndTime: '12:00',
          workingDaysPerWeek: 5,
          weeklyHours: 20,
          allowFlexibleHours: false,
          isActive: true,
          shift: 'MORNING',
          contractType: 'ESTAGIO_20H',
          contractStartDate: new Date('2026-03-01T00:00:00.000Z'),
          contractEndDate: new Date('2026-11-30T00:00:00.000Z'),
          attendanceRecords: [],
        },
      ])

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(mockedFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: 'EMPLOYEE', profileComplete: true, isActive: true },
          select: expect.objectContaining({
            isActive: true,
            contractStartDate: true,
            contractEndDate: true,
          }),
        })
      )
      expect(body.employees).toHaveLength(1)
      expect(body.employees[0]).toMatchObject({
        id: 'active-1',
        contractStartDate: '2026-03-01T00:00:00.000Z',
        contractEndDate: '2026-11-30T00:00:00.000Z',
      })
    }
  )
})
