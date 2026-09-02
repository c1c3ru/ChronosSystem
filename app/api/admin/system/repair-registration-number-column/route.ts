import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/admin/system/repair-registration-number-column
//
// Reparo emergencial: o deploy da Vercel só roda `next build` — nada aplica
// `prisma migrate deploy` contra o banco de produção — então a migração
// 20260902132210_add_student_registration_number nunca chegou a criar a
// coluna User.registrationNumber lá, mesmo com o código já em produção
// esperando por ela. Isso derruba com 500 qualquer rota que a selecione
// (inclusive GET /api/users). Esta rota aplica a mesma alteração via SQL
// direto, sem depender do pipeline de migração.
//
// IF NOT EXISTS torna a operação idempotente: pode ser chamada de novo sem
// erro, inclusive depois que a migração for aplicada pelo caminho normal.
// Restrito a ADMIN.
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem aplicar reparos de schema' },
        { status: 403 }
      )
    }

    await prisma.$executeRawUnsafe(
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;'
    )

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SCHEMA_REPAIR_REGISTRATION_NUMBER_COLUMN',
        resource: 'USER',
        details: `Coluna registrationNumber garantida manualmente por ${session.user.email}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Coluna registrationNumber garantida no banco de dados.',
    })
  } catch (error: unknown) {
    console.error('Erro ao aplicar reparo de schema (registrationNumber):', error)
    const details = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Erro interno do servidor', details }, { status: 500 })
  }
}
