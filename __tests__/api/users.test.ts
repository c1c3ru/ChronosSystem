import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/users/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma')

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('returns 401 when user is not admin or supervisor', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'EMPLOYEE', email: 'test@test.com' }
      } as any)

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('returns users when user is admin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN', email: 'admin@test.com' }
      } as any)

      const mockUsers = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
          role: 'EMPLOYEE',
          createdAt: new Date(),
          _count: { attendanceRecords: 5 }
        }
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any)
      mockPrisma.user.count.mockResolvedValue(1)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/users?page=1&limit=10',
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.users).toEqual(mockUsers)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      })
    })

    it('handles search parameters correctly', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN', email: 'admin@test.com' }
      } as any)

      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/users?search=john&role=EMPLOYEE&page=2&limit=5',
      })

      await GET(req as any)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: 'john', mode: 'insensitive' } },
                { email: { contains: 'john', mode: 'insensitive' } },
                { studentId: { contains: 'john', mode: 'insensitive' } }
              ]
            },
            { role: 'EMPLOYEE' }
          ]
        },
        select: expect.any(Object),
        skip: 5, // (page 2 - 1) * limit 5
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('POST /api/users', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New User',
          email: 'new@test.com',
          password: 'password123',
          role: 'EMPLOYEE'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })

    it('returns 400 when email already exists', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN', email: 'admin@test.com' }
      } as any)

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '2',
        email: 'existing@test.com'
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New User',
          email: 'existing@test.com',
          password: 'password123',
          role: 'EMPLOYEE'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email já está em uso')
    })

    it('creates user successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN', email: 'admin@test.com' }
      } as any)

      // Mock that email doesn't exist
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const newUser = {
        id: '2',
        name: 'New User',
        email: 'new@test.com',
        role: 'EMPLOYEE',
        createdAt: new Date()
      }

      mockPrisma.user.create.mockResolvedValue(newUser as any)
      mockPrisma.auditLog.create.mockResolvedValue({} as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New User',
          email: 'new@test.com',
          password: 'password123',
          role: 'EMPLOYEE'
        }
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newUser)
      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })

    it('returns 400 for invalid data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN', email: 'admin@test.com' }
      } as any)

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid: not a valid email
          password: '123', // Invalid: too short
          role: 'INVALID_ROLE' // Invalid: not a valid role
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
