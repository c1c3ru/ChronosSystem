import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getShiftDescription } from '@/lib/shift-validation'

// Force dynamic rendering - depende da sessão do usuário, nunca deve ser cacheado/estático
export const dynamic = 'force-dynamic'

const CSV_HEADERS = ['Nome Completo', 'Matrícula', 'E-mail', 'Turno', 'Status']

type StudentRow = {
  name: string | null
  email: string
  siapeNumber: string | null
  shift: string
  isActive: boolean
}

// Escapa aspas (RFC 4180) e neutraliza fórmulas (=, +, -, @) para evitar CSV
// injection quando o arquivo é aberto no Excel/Sheets a partir de dados de usuário.
function sanitizeCsvField(value: string): string {
  const field = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${field.replace(/"/g, '""')}"`
}

function buildStudentsCsv(students: StudentRow[]): string {
  const rows = students.map((student) =>
    [
      sanitizeCsvField(student.name || 'N/A'),
      sanitizeCsvField(student.siapeNumber || 'N/A'),
      sanitizeCsvField(student.email),
      sanitizeCsvField(
        getShiftDescription(student.shift as 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID')
      ),
      sanitizeCsvField(student.isActive ? 'Ativo' : 'Inativo'),
    ].join(',')
  )

  const headerLine = CSV_HEADERS.map((header) => sanitizeCsvField(header)).join(',')
  const csvContent = [headerLine, ...rows].join('\r\n')

  // BOM UTF-8: garante que o Excel reconheça acentos/caracteres especiais (ç, ã, é).
  const BOM = '\uFEFF'
  return `${BOM}${csvContent}`
}

// GET /api/admin/students/export - Exporta todos os alunos (estagiários) cadastrados em CSV.
// Restrito a ADMIN/SUPERVISOR.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para exportar dados de alunos' },
        { status: 403 }
      )
    }

    const students = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        name: true,
        email: true,
        siapeNumber: true,
        shift: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    const csv = buildStudentsCsv(students)

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'STUDENTS_EXPORTED',
        resource: 'USER',
        details: `Exportação CSV de ${students.length} aluno(s) por ${session.user.email}`,
      },
    })

    const fileName = `alunos_chronos_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao exportar alunos para CSV:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
