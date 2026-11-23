import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  NO_DEPARTMENT,
  filterRowsByStatus,
  groupRecordsByStudentDay,
  parseAttendanceSearchParams,
  rowsToCsv,
  summarizeRows,
} from '@/lib/attendance-search'

export const dynamic = 'force-dynamic'

/** Teto de registros lidos por busca (93 dias × ~40 alunos × 4 batidas cabem com folga). */
const MAX_RECORDS = 20_000

/**
 * GET /api/admin/attendance-records — busca os registros de entrada e saída
 * dos alunos, agrupados por aluno e dia.
 *
 * Query: q (nome, e-mail ou matrícula), from/to (AAAA-MM-DD, padrão últimos 7
 * dias), department (setor; `__NONE__` = sem setor), status (ALL | OPEN |
 * COMPLETE), page, limit, format=csv (exporta todas as linhas, sem paginar).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const parsed = parseAttendanceSearchParams(request.nextUrl.searchParams)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const params = parsed.params

    const userWhere: Prisma.UserWhereInput = { role: 'EMPLOYEE' }
    if (params.q) {
      userWhere.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { email: { contains: params.q, mode: 'insensitive' } },
        { registrationNumber: { contains: params.q, mode: 'insensitive' } },
      ]
    }
    if (params.department === NO_DEPARTMENT) {
      userWhere.AND = [{ OR: [{ department: null }, { department: '' }] }]
    } else if (params.department) {
      userWhere.department = params.department
    }

    const [records, departmentRows] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: {
          timestamp: { gte: params.from, lte: params.to },
          user: userWhere,
        },
        select: {
          id: true,
          type: true,
          timestamp: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              registrationNumber: true,
              department: true,
            },
          },
          machine: { select: { name: true, location: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: MAX_RECORDS + 1,
      }),
      prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: { department: true },
        distinct: ['department'],
      }),
    ])

    const truncated = records.length > MAX_RECORDS
    const rows = filterRowsByStatus(
      groupRecordsByStudentDay(truncated ? records.slice(0, MAX_RECORDS) : records),
      params.status
    )

    if (request.nextUrl.searchParams.get('format') === 'csv') {
      const filename = `registros-ponto_${params.fromKey}_a_${params.toKey}.csv`
      return new NextResponse(rowsToCsv(rows), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / params.limit))
    const page = Math.min(params.page, totalPages)
    const start = (page - 1) * params.limit

    const departments = departmentRows
      .map((d) => d.department?.trim() ?? '')
      .filter(Boolean)
      .filter((d, i, all) => all.indexOf(d) === i)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))

    return NextResponse.json({
      success: true,
      range: { from: params.fromKey, to: params.toKey },
      rows: rows.slice(start, start + params.limit),
      summary: summarizeRows(rows),
      departments,
      truncated,
      pagination: {
        page,
        limit: params.limit,
        total: rows.length,
        totalPages,
      },
    })
  } catch (error: unknown) {
    console.error('Erro ao buscar registros de ponto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
