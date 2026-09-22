import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { backfillRegistrationNumbers } from '@/lib/backfill-registration-numbers'

// Force dynamic rendering - depende da sessão do usuário, nunca deve ser cacheado/estático
export const dynamic = 'force-dynamic'

// POST /api/admin/students/backfill-registration-number - Preenche a matrícula
// dos alunos a partir do que já foi digitado em rascunhos de documentos
// (FormDraft.student_enrollment), sem sobrescrever quem já tem uma. Restrito a
// ADMIN (grava em lote sobre potencialmente muitos usuários). Passe
// ?dryRun=true para simular sem gravar nada.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem migrar matrículas em lote' },
        { status: 403 }
      )
    }

    const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true'

    const result = await backfillRegistrationNumbers(prisma, dryRun)

    if (!dryRun && result.updated > 0) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'STUDENTS_REGISTRATION_NUMBER_BACKFILLED',
          resource: 'USER',
          details: `Matrícula preenchida a partir de rascunhos de documento para ${result.updated} aluno(s) por ${session.user.email}`,
        },
      })
    }

    return NextResponse.json({
      dryRun,
      totalDrafts: result.totalDrafts,
      candidateCount: result.candidateCount,
      updated: result.updated,
      skippedAlreadySet: result.skippedAlreadySet,
    })
  } catch (error: unknown) {
    console.error('Erro ao migrar matrículas de alunos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
