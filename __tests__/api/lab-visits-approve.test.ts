/**
 * @jest-environment node
 *
 * Ver comentário equivalente em lab-visits-status.test.ts: NextResponse.json
 * não funciona de forma confiável sob o Headers/Response polyfillado do
 * jsdom (falta getSetCookie), então esta suíte roda no ambiente node.
 */
import { NextRequest } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    labVisit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/google-calendar', () => ({
  createCalendarEvent: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { createCalendarEvent } from '@/lib/google-calendar'
import { POST } from '@/app/api/lab-visits/[id]/approve/route'

const mockPrisma = prisma as unknown as {
  labVisit: { findUnique: jest.Mock; update: jest.Mock }
  auditLog: { create: jest.Mock }
}
const mockGetServerSession = getServerSession as jest.Mock
const mockCreateCalendarEvent = createCalendarEvent as jest.Mock

const PENDING_VISIT = {
  id: 'visit-1',
  labId: 'lab-1',
  responsibleName: 'Maria Silva',
  schoolName: 'Escola Estadual Exemplo',
  studentCount: 25,
  visitDate: new Date('2026-09-10'),
  shift: 'MORNING',
  contactEmail: 'maria@escola.exemplo.br',
  contactPhone: '85999999999',
  status: 'PENDING',
  googleCalendarEventId: null,
  lab: { id: 'lab-1', sigla: 'LAB-IA', nome: 'Laboratório de IA', descricao: '...' },
}

function buildRequest(): NextRequest {
  return new NextRequest('http://localhost/api/lab-visits/visit-1/approve', { method: 'POST' })
}

describe('POST /api/lab-visits/[id]/approve — autorização e integração com Google Calendar', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('rejeita usuário anônimo com 401 e NÃO chama o Google Calendar', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await POST(buildRequest(), { params: Promise.resolve({ id: 'visit-1' }) })

    expect(response.status).toBe(401)
    expect(mockPrisma.labVisit.update).not.toHaveBeenCalled()
    expect(mockCreateCalendarEvent).not.toHaveBeenCalled()
  })

  it('aprova a visita (PENDING -> CONFIRMED) e chama createCalendarEvent exatamente uma vez', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'staff@ifce.edu.br' },
    })
    mockPrisma.labVisit.findUnique.mockResolvedValue(PENDING_VISIT)
    mockPrisma.labVisit.update
      .mockResolvedValueOnce({ ...PENDING_VISIT, status: 'CONFIRMED' })
      .mockResolvedValueOnce({
        ...PENDING_VISIT,
        status: 'CONFIRMED',
        googleCalendarEventId: 'gcal-event-1',
      })
    mockCreateCalendarEvent.mockResolvedValue({ eventId: 'gcal-event-1' })
    mockPrisma.auditLog.create.mockResolvedValue({})

    const response = await POST(buildRequest(), { params: Promise.resolve({ id: 'visit-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockPrisma.labVisit.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'visit-1' }, data: { status: 'CONFIRMED' } })
    )
    expect(mockCreateCalendarEvent).toHaveBeenCalledTimes(1)
    expect(data.visit.googleCalendarEventId).toBe('gcal-event-1')
  })

  it('é idempotente: visita já CONFIRMED não dispara um novo evento no calendário', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'u1', email: 'staff@ifce.edu.br' },
    })
    mockPrisma.labVisit.findUnique.mockResolvedValue({ ...PENDING_VISIT, status: 'CONFIRMED' })

    const response = await POST(buildRequest(), { params: Promise.resolve({ id: 'visit-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.alreadyConfirmed).toBe(true)
    expect(mockCreateCalendarEvent).not.toHaveBeenCalled()
    expect(mockPrisma.labVisit.update).not.toHaveBeenCalled()
  })
})
