/**
 * @jest-environment node
 *
 * NextRequest/NextResponse dependem do fetch API nativo do Node (undici).
 * Sob o ambiente jsdom padrão do Jest, o Headers/Response polyfillado pelo
 * jsdom não implementa métodos que o Next usa internamente (ex.:
 * getSetCookie), quebrando até respostas de sucesso — daí rodar este
 * arquivo em `node` em vez do `jsdom` global do projeto.
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    laboratory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    labVisit: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

const mockPrisma = prisma as unknown as {
  laboratory: { findUnique: jest.Mock; findMany: jest.Mock }
  labVisit: {
    findFirst: jest.Mock
    findMany: jest.Mock
    create: jest.Mock
    createMany: jest.Mock
  }
  auditLog: { create: jest.Mock }
}
const mockGetServerSession = getServerSession as jest.Mock

describe('Integração: novas visitas nascem PENDING', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/lab-visits (formulário público) salva a visita com status PENDING', async () => {
    const { POST } = await import('@/app/api/lab-visits/route')

    mockPrisma.laboratory.findUnique.mockResolvedValue({
      id: 'lab-1',
      isActive: true,
    })
    mockPrisma.labVisit.findFirst.mockResolvedValue(null)
    mockPrisma.labVisit.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'visit-1', visitDate: data.visitDate, shift: data.shift, status: data.status })
    )

    const request = new NextRequest('http://localhost/api/lab-visits', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        labId: 'lab-1',
        responsibleName: 'Maria Silva',
        schoolName: 'Escola Estadual Exemplo',
        studentCount: 25,
        visitDate: '2026-09-10',
        shift: 'MORNING',
        contactEmail: 'maria@escola.exemplo.br',
        contactPhone: '85999999999',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockPrisma.labVisit.create).toHaveBeenCalledTimes(1)
    expect(mockPrisma.labVisit.create.mock.calls[0][0].data.status).toBe('PENDING')
    expect(data.visit.status).toBe('PENDING')
  })

  it('POST /api/lab-visits/confirm (solicitação interna) também salva como PENDING', async () => {
    const { POST } = await import('@/app/api/lab-visits/confirm/route')

    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'staff@ifce.edu.br', name: 'Equipe CTI' },
    })
    mockPrisma.laboratory.findMany.mockResolvedValue([{ id: 'lab-1', sigla: 'LAB-IA' }])
    mockPrisma.labVisit.findMany.mockResolvedValue([]) // nenhum CONFIRMED conflitante
    mockPrisma.labVisit.createMany.mockResolvedValue({ count: 1 })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const request = new NextRequest('http://localhost/api/lab-visits/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ labIds: ['lab-1'], visitDate: '2026-09-10', shift: 'MORNING' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockPrisma.labVisit.createMany).toHaveBeenCalledTimes(1)
    const createdData = mockPrisma.labVisit.createMany.mock.calls[0][0].data
    expect(createdData).toHaveLength(1)
    expect(createdData[0].status).toBe('PENDING')
    expect(data.requestedCount).toBe(1)
  })
})
