import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkReviewSchema = z.object({
  justificationIds: z.array(z.string().min(1)).min(1, 'Nenhuma justificativa selecionada'),
  action: z.enum(['APPROVED', 'REJECTED']),
})

const bulkDeleteSchema = z.union([
  z.object({ deleteAll: z.literal(true) }),
  z.object({ justificationIds: z.array(z.string().min(1)).min(1) }),
])

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => null)
    const parsed = bulkReviewSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }
    const { justificationIds, action } = parsed.data

    // Verify if all selected justifications are PENDING
    const justifications = await prisma.justification.findMany({
      where: {
        id: { in: justificationIds },
        status: 'PENDING',
      },
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
        status: 'PENDING',
      },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'BULK_REVIEW_JUSTIFICATIONS',
        resource: 'Justification',
        details: `Bulk ${action} for ${justifications.length} justifications. IDs: ${justificationIds.join(', ')}`,
        userId: session.user.id,
      },
    })

    // (Optional) Here we could create attendance records if action === 'APPROVED' and it was an ABSENCE,
    // but the system probably handles this elsewhere or expects the admin to do it.

    return NextResponse.json({ success: true, updatedCount: justifications.length })
  } catch (error) {
    console.error('Erro no bulk update de justificativas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/justifications/bulk - Excluir justificativas em lote (selecionadas ou todas)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const rawBody = await request.json().catch(() => null)
    const parsedDelete = bulkDeleteSchema.safeParse(rawBody)
    if (!parsedDelete.success) {
      return NextResponse.json(
        { error: 'Informe justificationIds ou deleteAll=true' },
        { status: 400 }
      )
    }
    const deleteAll = 'deleteAll' in parsedDelete.data ? parsedDelete.data.deleteAll : false
    const justificationIds =
      'justificationIds' in parsedDelete.data ? parsedDelete.data.justificationIds : undefined

    let deletedCount = 0

    if (deleteAll === true) {
      // Excluir TODAS as justificativas
      const result = await prisma.justification.deleteMany({})
      deletedCount = result.count

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_ALL_JUSTIFICATIONS',
          resource: 'JUSTIFICATION',
          details: `Todas as justificativas excluídas por ${session.user.name} (${deletedCount} registros)`,
        },
      })
    } else if (Array.isArray(justificationIds) && justificationIds.length > 0) {
      // Excluir justificativas selecionadas
      const result = await prisma.justification.deleteMany({
        where: { id: { in: justificationIds } },
      })
      deletedCount = result.count

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_BULK_JUSTIFICATIONS',
          resource: 'JUSTIFICATION',
          details: `${deletedCount} justificativas excluídas por ${session.user.name}. IDs: ${justificationIds.join(', ')}`,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Informe justificationIds ou deleteAll=true' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, deletedCount })
  } catch (error) {
    console.error('Erro ao excluir justificativas em lote:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
