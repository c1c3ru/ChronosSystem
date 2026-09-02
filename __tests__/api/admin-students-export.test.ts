/**
 * @jest-environment node
 *
 * Route Handlers do App Router rodam em runtime de servidor, não no browser.
 * O ambiente padrão do projeto (jsdom) usa sua própria implementação de
 * `Headers`, sem `getSetCookie`, o que quebra a construção de `NextResponse`
 * do Next.js internamente. O ambiente `node` expõe os globais nativos
 * corretos para testar Route Handlers.
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
    user: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

import { GET } from '@/app/api/admin/students/export/route'

const mockedGetServerSession = getServerSession as jest.Mock
const mockedFindMany = prisma.user.findMany as jest.Mock
const mockedAuditCreate = prisma.auditLog.create as jest.Mock

// Decodifica preservando o BOM (por padrão o TextDecoder o remove, o que
// mascararia justamente o que este teste precisa provar que existe).
function decodePreservingBom(buffer: ArrayBuffer): string {
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(buffer)
}

describe('GET /api/admin/students/export', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 401 quando não há usuário autenticado', async () => {
    mockedGetServerSession.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(401)
    expect(mockedFindMany).not.toHaveBeenCalled()
    expect(mockedAuditCreate).not.toHaveBeenCalled()
  })

  it('retorna 403 quando o usuário autenticado não é ADMIN/SUPERVISOR', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'aluno@example.com', role: 'EMPLOYEE' },
    })

    const response = await GET()

    expect(response.status).toBe(403)
    expect(mockedFindMany).not.toHaveBeenCalled()
    expect(mockedAuditCreate).not.toHaveBeenCalled()
  })

  it.each(['ADMIN', 'SUPERVISOR'])(
    'permite exportação para role %s e retorna CSV com BOM, cabeçalhos em português e dados formatados',
    async (role) => {
      mockedGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', email: 'gestor@example.com', role },
      })
      mockedFindMany.mockResolvedValue([
        {
          name: 'Maria da Conceição',
          email: 'maria@aluno.ifce.edu.br',
          registrationNumber: '20231234567',
          shift: 'MORNING',
          isActive: true,
        },
        {
          name: 'João Sousa',
          email: 'joao@aluno.ce.gov.br',
          registrationNumber: null,
          shift: 'AFTERNOON',
          isActive: false,
        },
      ])
      mockedAuditCreate.mockResolvedValue({})

      const response = await GET()
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const text = decodePreservingBom(buffer)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toContain('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment')
      expect(response.headers.get('Content-Disposition')).toMatch(
        /filename="alunos_chronos_\d{4}-\d{2}-\d{2}\.csv"/
      )

      // BOM UTF-8 (EF BB BF) no início dos bytes crus da resposta - é isso que o Excel
      // detecta para exibir acentuação corretamente.
      expect(bytes[0]).toBe(0xef)
      expect(bytes[1]).toBe(0xbb)
      expect(bytes[2]).toBe(0xbf)
      expect(text.charCodeAt(0)).toBe(0xfeff)

      const [headerLine, ...dataLines] = text.slice(1).split('\r\n')
      expect(headerLine).toBe('"Nome Completo","Matrícula","E-mail","Turno","Status"')
      expect(dataLines[0]).toBe(
        '"Maria da Conceição","20231234567","maria@aluno.ifce.edu.br","Período da Manhã","Ativo"'
      )
      expect(dataLines[1]).toBe(
        '"João Sousa","N/A","joao@aluno.ce.gov.br","Período da Tarde","Inativo"'
      )

      expect(mockedFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'EMPLOYEE' } })
      )
      expect(mockedAuditCreate).toHaveBeenCalledTimes(1)
      expect(mockedAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'STUDENTS_EXPORTED', userId: 'admin-1' }),
        })
      )
    }
  )

  it('neutraliza campos que começam com caracteres de fórmula (proteção contra CSV injection)', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'gestor@example.com', role: 'ADMIN' },
    })
    mockedFindMany.mockResolvedValue([
      {
        name: '=cmd|"/c calc"!A1',
        email: 'atacante@example.com',
        registrationNumber: null,
        shift: 'NIGHT',
        isActive: true,
      },
    ])
    mockedAuditCreate.mockResolvedValue({})

    const response = await GET()
    const text = decodePreservingBom(await response.arrayBuffer())

    expect(text).toContain("\"'=cmd")
    expect(text).not.toContain('"=cmd')
  })

  it('retorna 500 quando ocorre um erro inesperado ao consultar o banco', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'admin-1', email: 'gestor@example.com', role: 'ADMIN' },
    })
    mockedFindMany.mockRejectedValue(new Error('Falha de conexão'))

    const response = await GET()

    expect(response.status).toBe(500)
  })
})
