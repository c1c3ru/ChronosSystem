import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMachineSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  isActive: z.boolean().optional()
})

// GET /api/machines/[id] - Buscar máquina por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const machine = await prisma.machine.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            attendanceRecords: true,
            qrEvents: true
          }
        }
      }
    })

    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 })
    }

    return NextResponse.json(machine)
  } catch (error) {
    console.error('Erro ao buscar máquina:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH /api/machines/[id] - Atualizar máquina
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateMachineSchema.parse(body)

    // Verificar se máquina existe
    const existingMachine = await prisma.machine.findUnique({
      where: { id: params.id }
    })

    if (!existingMachine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 })
    }

    const machine = await prisma.machine.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        updatedAt: true
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_MACHINE',
        resource: 'MACHINE',
        details: `Máquina atualizada: ${machine.name} - ${machine.location}`
      }
    })

    return NextResponse.json(machine)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Erro ao atualizar máquina:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/machines/[id] - Deletar máquina
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const machine = await prisma.machine.findUnique({
      where: { id: params.id },
      select: { 
        name: true, 
        location: true,
        _count: {
          select: {
            attendanceRecords: true
          }
        }
      }
    })

    if (!machine) {
      return NextResponse.json({ error: 'Máquina não encontrada' }, { status: 404 })
    }

    // Verificar se há registros associados
    if (machine._count.attendanceRecords > 0) {
      return NextResponse.json({ 
        error: 'Não é possível deletar máquina com registros de ponto associados' 
      }, { status: 400 })
    }

    await prisma.machine.delete({
      where: { id: params.id }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_MACHINE',
        resource: 'MACHINE',
        details: `Máquina deletada: ${machine.name} - ${machine.location}`
      }
    })

    return NextResponse.json({ message: 'Máquina deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar máquina:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
