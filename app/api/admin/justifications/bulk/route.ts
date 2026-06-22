import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { justificationIds, action } = body

    if (!Array.isArray(justificationIds) || justificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma justificativa selecionada' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida. Use APPROVED ou REJECTED' },
        { status: 400 }
      )
    }

    // Verify if all selected justifications are PENDING
    const justifications = await prisma.justification.findMany({
      where: {
        id: { in: justificationIds },
        status: 'PENDING'
      }
    })

    if (justifications.length !== justificationIds.length) {
      return NextResponse.json(
        { error: 'Algumas justificativas já foram analisadas ou não existem.' },
        { status: 400 }
      )
    }

    // Bulk update
    await prisma.justification.updateMany({
      where: {
        id: { in: justificationIds },
        status: 'PENDING'
      },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'BULK_REVIEW_JUSTIFICATIONS',
        resource: 'Justification',
        details: `Bulk ${action} for ${justifications.length} justifications. IDs: ${justificationIds.join(', ')}`,
        userId: session.user.id
      }
    })

    // (Optional) Here we could create attendance records if action === 'APPROVED' and it was an ABSENCE, 
    // but the system probably handles this elsewhere or expects the admin to do it.

    return NextResponse.json({ success: true, updatedCount: justifications.length })

  } catch (error) {
    console.error('Erro no bulk update de justificativas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
