import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/justifications/[id] - Aprovar/Rejeitar justificativa
// DELETE /api/admin/justifications/[id] - Excluir justificativa individual

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: justificationId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { status, adminResponse } = await request.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    // Atualizar justificativa no banco de dados
    await prisma.justification.update({
      where: { id: justificationId },
      data: {
        status,
        adminResponse: adminResponse || null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_JUSTIFICATION',
        resource: 'JUSTIFICATION',
        details: `Justificativa ${justificationId} ${status.toLowerCase()} por ${session.user.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Justificativa ${status.toLowerCase()} com sucesso`,
    })
  } catch (error) {
    console.error('Erro ao atualizar justificativa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: justificationId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.justification.delete({
      where: { id: justificationId },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_JUSTIFICATION',
        resource: 'JUSTIFICATION',
        details: `Justificativa ${justificationId} excluída por ${session.user.name}`,
      },
    })

    return NextResponse.json({ success: true, message: 'Justificativa excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir justificativa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
