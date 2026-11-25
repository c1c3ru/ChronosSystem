/**
 * @jest-environment node
 *
 * Tela "Meu perfil": o aluno altera o próprio contato e horário de turno,
 * mas não dados administrativos.
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
  shift: 'AFTERNOON',
  shiftStartTime: '13:00',
  shiftEndTime: '17:00',
  workingDaysPerWeek: 5,
}

describe('PUT /api/users/[id] - aluno editando o próprio perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedSession.mockResolvedValue({ user: { id: 'aluno-1', role: 'EMPLOYEE' } })
    mockedFind.mockResolvedValue(existing)
    mockedUpdate.mockResolvedValue({ ...existing, updatedAt: new Date() })
    mockedAudit.mockResolvedValue({})
  })

  it('devolve o horário do turno na consulta do próprio perfil', async () => {
    const response = await GET(new NextRequest(endpoint), params)
    expect(response.status).toBe(200)
    expect(mockedFind).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          shift: true,
          shiftStartTime: true,
          shiftEndTime: true,
          workingDaysPerWeek: true,
        }),
      })
    )
  })

  it('salva o novo horário e registra o antes e o depois na auditoria', async () => {
    const response = await PUT(
      request({ shift: 'AFTERNOON', shiftStartTime: '14:00', shiftEndTime: '18:00' }),
      params
    )
    expect(response.status).toBe(200)
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'aluno-1' },
        data: expect.objectContaining({ shiftStartTime: '14:00', shiftEndTime: '18:00' }),
      })
    )
    const details = mockedAudit.mock.calls[0][0].data.details as string
    expect(details).toContain('próprio usuário')
    expect(details).toContain('13:00–17:00')
    expect(details).toContain('14:00–18:00')
  })

  it('aceita telefone, endereço e contato de emergência', async () => {
    const response = await PUT(
      request({
        phone: '(85) 98888-7777',
        address: 'Rua Nova, 45, Centro, Maracanaú',
        emergencyContact: 'Mãe',
        emergencyPhone: '(85) 97777-6666',
        workingDaysPerWeek: 3,
      }),
      params
    )
    expect(response.status).toBe(200)
  })

  it('recusa fim antes do início, considerando o horário já salvo', async () => {
    const response = await PUT(request({ shiftEndTime: '12:00' }), params)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.fieldErrors.shiftEndTime).toMatch(/depois do horário de início/)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('recusa horário fora do formato HH:MM', async () => {
    const response = await PUT(request({ shiftStartTime: '8h' }), params)
    expect(response.status).toBe(400)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it.each([
    [{ email: 'outro@example.com' }],
    [{ name: 'Outro Nome' }],
    [{ department: 'TI' }],
    [{ registrationNumber: '123' }],
    [{ allowFlexibleHours: true }],
    [{ password: 'senha-nova-segura' }],
  ])('impede o aluno de alterar dado administrativo %j', async (body) => {
    const response = await PUT(request(body), params)
    expect(response.status).toBe(403)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('impede o aluno de alterar o perfil de outra pessoa', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'aluno-2', role: 'EMPLOYEE' } })
    const response = await PUT(request({ shiftStartTime: '14:00' }), params)
    expect(response.status).toBe(403)
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('administrador altera horário e horas flexíveis do aluno', async () => {
    mockedSession.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } })
    const response = await PUT(
      request({ shiftStartTime: '07:30', shiftEndTime: '11:30', allowFlexibleHours: true }),
      params
    )
    expect(response.status).toBe(200)
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ shiftStartTime: '07:30', allowFlexibleHours: true }),
      })
    )
  })
})
