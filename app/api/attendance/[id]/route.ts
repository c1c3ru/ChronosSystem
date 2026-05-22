import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateHourBalance } from '@/lib/hour-calculator'
import { apiLogger } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/attendance/[id] - Obter detalhes de um registro
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id: recordId } = await params

    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    }

    // Verificar permissões: admin/supervisor podem ver qualquer registro, usuário comum só seu próprio
    const canView =
      ['ADMIN', 'SUPERVISOR'].includes(session.user.role) || record.userId === session.user.id

    if (!canView) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    return NextResponse.json(record)
  } catch (error: unknown) {
    apiLogger.error('Error fetching attendance record', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/attendance/[id] - Deletar um registro (apenas admin/supervisor)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas admin e supervisor podem deletar
    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas admin/supervisor podem deletar registros.' },
        { status: 403 }
      )
    }

    const { id: recordId } = await params

    // Verificar se o registro existe
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    }

    // Deletar o registro
    await prisma.attendanceRecord.delete({
      where: { id: recordId },
    })

    // Atualizar saldo de horas do usuário afetado
    try {
      await updateHourBalance(record.userId)
    } catch (hourError: unknown) {
      apiLogger.error('Error updating hour balance after deletion', { error: hourError instanceof Error ? hourError.message : String(hourError) })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_ATTENDANCE_RECORD',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${record.type} deletado - Usuário: ${record.user.name} (${record.user.email}), Máquina: ${record.machine.name}, Data: ${record.timestamp.toLocaleString('pt-BR')}`,
      },
    })

    apiLogger.info('Attendance record deleted', {
      recordId: record.id,
      type: record.type,
      deletedBy: session.user.id,
    })

    return NextResponse.json({
      success: true,
      message: `Registro de ${record.type === 'ENTRY' ? 'entrada' : 'saída'} deletado com sucesso`,
      deletedRecord: {
        id: record.id,
        type: record.type,
        timestamp: record.timestamp,
        user: record.user,
        machine: record.machine,
      },
    })
  } catch (error: unknown) {
    apiLogger.error('Error deleting attendance record', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH /api/attendance/[id] - Atualizar um registro (apenas admin/supervisor)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas admin e supervisor podem atualizar
    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado. Apenas admin/supervisor podem atualizar registros.' },
        { status: 403 }
      )
    }

    const { id: recordId } = await params
    const body = await request.json()

    // Verificar se o registro existe
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
    })

    if (!record) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
    }

    // Apenas permitir atualizar timestamp e tipo
    const updateData: Record<string, unknown> = {}

    if (body.timestamp) {
      updateData.timestamp = new Date(body.timestamp)
    }

    if (body.type && ['ENTRY', 'EXIT'].includes(body.type)) {
      updateData.type = body.type
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 })
    }

    // Atualizar o registro
    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        machine: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    })

    // Atualizar saldo de horas do usuário afetado
    try {
      await updateHourBalance(record.userId)
    } catch (hourError: unknown) {
      apiLogger.error('Error updating hour balance after update', { error: hourError instanceof Error ? hourError.message : String(hourError) })
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_ATTENDANCE_RECORD',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${record.type} atualizado - Usuário ID: ${record.userId}, Alterações: ${JSON.stringify(updateData)}`,
      },
    })

    apiLogger.info('Attendance record updated', {
      recordId: record.id,
      updatedBy: session.user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Registro atualizado com sucesso',
      updatedRecord,
    })
  } catch (error: unknown) {
    apiLogger.error('Error updating attendance record', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
