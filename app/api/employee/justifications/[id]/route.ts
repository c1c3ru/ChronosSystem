import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/employee/justifications/[id] — Excluir justificativa individual
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const justification = await prisma.justification.findFirst({
      where: { id: id, userId: session.user.id },
    })

    if (!justification) {
      return NextResponse.json({ error: 'Justificativa não encontrada' }, { status: 404 })
    }

    if (justification.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Apenas justificativas pendentes podem ser excluídas' },
        { status: 400 }
      )
    }

    await prisma.justification.delete({ where: { id: id } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'JUSTIFICATION_DELETED',
        resource: 'JUSTIFICATION',
        details: `Justificativa excluída: ${justification.type} - ${justification.date.toISOString().split('T')[0]}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Justificativa excluída com sucesso' })
  } catch (error: unknown) {
    console.error('Erro ao excluir justificativa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
