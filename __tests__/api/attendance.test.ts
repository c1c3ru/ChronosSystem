import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/attendance/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma')
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'mocked-hash')
    }))
  }))
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/attendance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/attendance', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autenticado')
    })

    it('returns attendance records for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const mockRecords = [
        {
          id: '1',
          userId: 'user1',
          type: 'ENTRY',
          timestamp: new Date(),
          user: { name: 'Test User', email: 'user@test.com' },
          machine: { name: 'Machine 1', location: 'Location 1' }
        }
      ]

      mockPrisma.attendanceRecord.findMany.mockResolvedValue(mockRecords as any)
      mockPrisma.attendanceRecord.count.mockResolvedValue(1)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?page=1&limit=20',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.records).toEqual(mockRecords)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1
      })
    })

    it('allows admin to view other users records', async () => {
      const mockSession = {
        user: { id: 'admin1', role: 'ADMIN', email: 'admin@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      mockPrisma.attendanceRecord.findMany.mockResolvedValue([])
      mockPrisma.attendanceRecord.count.mockResolvedValue(0)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?userId=user1',
      })

      const response = await GET(req as any)

      expect(response.status).toBe(200)
      expect(mockPrisma.attendanceRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { timestamp: 'desc' }
      })
    })

    it('prevents employee from viewing other users records', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/attendance?userId=user2', // Different user
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Não autorizado')
    })
  })

  describe('POST /api/attendance', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'POST',
        body: {
          machineId: 'machine1',
          type: 'ENTRY',
          qrData: 'test-qr-data'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autenticado')
    })

    it('returns 400 when machine is not found', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      mockPrisma.machine.findUnique.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'POST',
        body: {
          machineId: 'nonexistent',
          type: 'ENTRY',
          qrData: 'test-qr-data'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Máquina não encontrada ou inativa')
    })

    it('returns 400 when machine is inactive', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      mockPrisma.machine.findUnique.mockResolvedValue({
        id: 'machine1',
        name: 'Machine 1',
        isActive: false
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          machineId: 'machine1',
          type: 'ENTRY',
          qrData: 'test-qr-data'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Máquina não encontrada ou inativa')
    })

    it('validates entry/exit sequence - requires entry first', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      mockPrisma.machine.findUnique.mockResolvedValue({
        id: 'machine1',
        name: 'Machine 1',
        isActive: true
      } as any)

      // Mock last record as ENTRY
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue({
        id: '1',
        type: 'ENTRY',
        hash: 'previous-hash'
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          machineId: 'machine1',
          type: 'ENTRY', // Should be EXIT after ENTRY
          qrData: 'test-qr-data'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Você deve registrar uma saída primeiro')
    })

    it('creates attendance record successfully', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      mockPrisma.machine.findUnique.mockResolvedValue({
        id: 'machine1',
        name: 'Machine 1',
        location: 'Location 1',
        isActive: true
      } as any)

      // No previous record, so ENTRY is expected
      mockPrisma.attendanceRecord.findFirst.mockResolvedValue(null)

      const newRecord = {
        id: 'record1',
        userId: 'user1',
        machineId: 'machine1',
        type: 'ENTRY',
        timestamp: new Date(),
        user: { name: 'Test User', email: 'user@test.com' },
        machine: { name: 'Machine 1', location: 'Location 1' }
      }

      mockPrisma.attendanceRecord.create.mockResolvedValue(newRecord as any)
      mockPrisma.auditLog.create.mockResolvedValue({} as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          machineId: 'machine1',
          type: 'ENTRY',
          qrData: 'test-qr-data',
          latitude: -23.5505,
          longitude: -46.6333
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newRecord)
      expect(mockPrisma.attendanceRecord.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          machineId: 'machine1',
          type: 'ENTRY',
          qrData: 'test-qr-data',
          latitude: -23.5505,
          longitude: -46.6333,
          hash: 'mocked-hash',
          prevHash: null
        },
        include: expect.any(Object)
      })
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })

    it('returns 400 for invalid data', async () => {
      const mockSession = {
        user: { id: 'user1', role: 'EMPLOYEE', email: 'user@test.com' }
      }
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          machineId: '', // Invalid: empty
          type: 'INVALID_TYPE', // Invalid: not ENTRY or EXIT
          qrData: '' // Invalid: empty
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Dados inválidos')
      expect(data.details).toBeDefined()
    })
  })
})
