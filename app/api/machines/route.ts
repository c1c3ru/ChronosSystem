import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMachineSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  location: z.string().min(2, 'Localização deve ter pelo menos 2 caracteres'),
  isActive: z.boolean().optional().default(true)
})

// GET /api/machines - Listar máquinas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const where = activeOnly ? { isActive: true } : {}

    const machines = await prisma.machine.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(machines)
  } catch (error) {
    console.error('Erro ao buscar máquinas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/machines - Criar máquina
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMachineSchema.parse(body)

    const machine = await prisma.machine.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        createdAt: true
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_MACHINE',
        resource: 'MACHINE',
        details: `Máquina criada: ${machine.name} - ${machine.location}`
      }
    })

    return NextResponse.json(machine, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Erro ao criar máquina:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
