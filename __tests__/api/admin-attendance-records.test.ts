/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/prisma', () => ({
  prisma: {
    attendanceRecord: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
  },
}))

import { GET } from '@/app/api/admin/attendance-records/route'

const mockedSession = getServerSession as jest.Mock
const mockedRecords = prisma.attendanceRecord.findMany as jest.Mock
const mockedUsers = prisma.user.findMany as jest.Mock

function request(query: string) {
  return new NextRequest(`http://localhost/api/admin/attendance-records?${query}`)
}

const user = {
  id: 'u1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  registrationNumber: '2024001',
  department: 'CTI-MAR',
}

describe('GET /api/admin/attendance-records', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUsers.mockResolvedValue([
      { department: 'TI' },
      { department: 'CTI-MAR' },
      { department: null },
    ])
  })

  it('não revela registros para quem não é admin ou supervisor', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'x', role: 'EMPLOYEE' } })
    expect((await GET(request(''))).status).toBe(401)
    expect(mockedRecords).not.toHaveBeenCalled()
  })

  it('devolve 400 para período inválido', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'a', role: 'ADMIN' } })
    const res = await GET(request('from=2026-11-20&to=2026-11-01'))
    expect(res.status).toBe(400)
    expect(mockedRecords).not.toHaveBeenCalled()
  })

  it.each(['ADMIN', 'SUPERVISOR'])('busca por nome, e-mail ou matrícula para %s', async (role) => {
    mockedSession.mockResolvedValue({ user: { id: 'a', role } })
    mockedRecords.mockResolvedValue([
      { id: 'r2', type: 'EXIT', timestamp: new Date('2026-11-20T12:00:00Z'), user, machine: null },
      { id: 'r1', type: 'ENTRY', timestamp: new Date('2026-11-20T08:00:00Z'), user, machine: null },
    ])

    const res = await GET(request('q=2024&from=2026-11-20&to=2026-11-21&department=CTI-MAR'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(mockedRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          timestamp: {
            gte: new Date('2026-11-20T00:00:00.000Z'),
            lte: new Date('2026-11-21T23:59:59.999Z'),
          },
          user: {
            role: 'EMPLOYEE',
            department: 'CTI-MAR',
            OR: [
              { name: { contains: '2024', mode: 'insensitive' } },
              { email: { contains: '2024', mode: 'insensitive' } },
              { registrationNumber: { contains: '2024', mode: 'insensitive' } },
            ],
          },
        },
      })
    )
    expect(body.departments).toEqual(['CTI-MAR', 'TI'])
    expect(body.rows).toHaveLength(1)
    expect(body.rows[0]).toMatchObject({
      date: '2026-11-20',
      firstEntry: '08:00',
      lastExit: '12:00',
      workedMinutes: 240,
    })
    expect(body.pagination).toEqual({ page: 1, limit: 50, total: 1, totalPages: 1 })
  })

  it('filtra quem está sem setor', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'a', role: 'ADMIN' } })
    mockedRecords.mockResolvedValue([])
    await GET(request('department=__NONE__'))
    expect(mockedRecords.mock.calls[0][0].where.user).toEqual({
      role: 'EMPLOYEE',
      AND: [{ OR: [{ department: null }, { department: '' }] }],
    })
  })

  it('exporta CSV', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'a', role: 'ADMIN' } })
    mockedRecords.mockResolvedValue([
      { id: 'r1', type: 'ENTRY', timestamp: new Date('2026-11-20T08:00:00Z'), user, machine: null },
    ])
    const res = await GET(request('format=csv&from=2026-11-20&to=2026-11-20'))
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    expect(res.headers.get('Content-Disposition')).toContain(
      'registros-ponto_2026-11-20_a_2026-11-20.csv'
    )
    expect(await res.text()).toContain('20/11/2026;Ana Souza;2024001')
  })
})
