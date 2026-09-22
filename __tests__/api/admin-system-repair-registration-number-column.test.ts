/**
 * @jest-environment node
 *
 * Route Handlers do App Router rodam em runtime de servidor. Ver
 * __tests__/api/admin-students-export.test.ts para o motivo de usar o
 * ambiente `node` (o jsdom padrão quebra `NextResponse` internamente).
 */
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $executeRawUnsafe: jest.fn(),
    auditLog: {
      create: jest.fn(),
    },
  },
}))

import { POST } from '@/app/api/admin/system/repair-registration-number-column/route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedExecuteRawUnsafe = prisma.$executeRawUnsafe as jest.Mock
const mockedAuditCreate = prisma.auditLog.create as jest.Mock

describe('POST /api/admin/system/repair-registration-number-column', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 401 quando não há usuário autenticado', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const response = await POST()

    expect(response.status).toBe(401)
    expect(mockedExecuteRawUnsafe).not.toHaveBeenCalled()
  })

  it('retorna 403 quando o usuário autenticado não é ADMIN', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'sup-1', email: 'sup@example.com', role: 'SUPERVISOR' },
    })

    const response = await POST()

    expect(response.status).toBe(403)
    expect(mockedExecuteRawUnsafe).not.toHaveBeenCalled()
  })

  it('aplica o ALTER TABLE idempotente e registra auditoria quando ADMIN', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    })
    mockedExecuteRawUnsafe.mockResolvedValue(0)
    mockedAuditCreate.mockResolvedValue({})

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)

    expect(mockedExecuteRawUnsafe).toHaveBeenCalledTimes(1)
    expect(mockedExecuteRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('ADD COLUMN IF NOT EXISTS "registrationNumber"')
    )

    expect(mockedAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'SCHEMA_REPAIR_REGISTRATION_NUMBER_COLUMN',
          userId: 'admin-1',
        }),
      })
    )
  })

  it('retorna 500 sem vazar o erro interno do banco quando a alteração falha', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    })
    mockedExecuteRawUnsafe.mockRejectedValue(new Error('permission denied for table User'))

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Erro interno do servidor')
    // Em produção (e em teste/CI) o detalhe cru do erro de banco não deve
    // chegar ao cliente — evita expor nomes de tabela/coluna e mensagens do
    // driver do Postgres. Ver lib/logger.ts: o erro completo ainda é
    // registrado no log do servidor via console.error.
    expect(body.details).toBeUndefined()
    expect(mockedAuditCreate).not.toHaveBeenCalled()
  })

  it('em desenvolvimento, expõe o detalhe do erro para depuração local', async () => {
    // process.env.NODE_ENV é tipado como readonly pelo next (next/types/global.d.ts),
    // então não pode ser reatribuído diretamente — jest.replaceProperty contorna isso
    // sem precisar de cast e restaura o valor original ao final do teste.
    const nodeEnvProp = jest.replaceProperty(process.env, 'NODE_ENV', 'development')

    try {
      mockedGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
      })
      mockedExecuteRawUnsafe.mockRejectedValue(new Error('permission denied for table User'))

      const response = await POST()
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.details).toContain('permission denied')
    } finally {
      nodeEnvProp.restore()
    }
  })
})
