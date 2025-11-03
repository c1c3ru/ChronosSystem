import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const createAttendanceSchema = z.object({
  machineId: z.string().cuid(),
  type: z.enum(['ENTRY', 'EXIT']),
  qrData: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

// GET /api/attendance - Listar registros de ponto
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const machineId = searchParams.get('machineId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Verificar permissões
    const canViewAll = ['ADMIN', 'SUPERVISOR'].includes(session.user.role)
    if (!canViewAll && userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Construir filtros
    const where: any = {}
    
    if (userId && (canViewAll || userId === session.user.id)) {
      where.userId = userId
    } else if (!canViewAll) {
      where.userId = session.user.id
    }
    
    if (machineId) {
      where.machineId = machineId
    }
    
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = new Date(startDate)
      if (endDate) where.timestamp.lte = new Date(endDate)
    }

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          machine: {
            select: {
              name: true,
              location: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.attendanceRecord.count({ where })
    ])

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar registros de ponto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/attendance - Criar registro de ponto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAttendanceSchema.parse(body)

    // Verificar se a máquina existe e está ativa
    const machine = await prisma.machine.findUnique({
      where: { id: validatedData.machineId }
    })

    if (!machine || !machine.isActive) {
      return NextResponse.json({ error: 'Máquina não encontrada ou inativa' }, { status: 400 })
    }

    // Buscar último registro do usuário para determinar o tipo esperado
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' }
    })

    // Validar sequência de entrada/saída
    const expectedType = !lastRecord || lastRecord.type === 'EXIT' ? 'ENTRY' : 'EXIT'
    if (validatedData.type !== expectedType) {
      const message = expectedType === 'ENTRY' 
        ? 'Você deve registrar uma entrada primeiro'
        : 'Você deve registrar uma saída primeiro'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Gerar hash para integridade
    const dataToHash = `${session.user.id}-${validatedData.machineId}-${validatedData.type}-${Date.now()}`
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex')

    // Criar registro
    const record = await prisma.attendanceRecord.create({
      data: {
        userId: session.user.id,
        machineId: validatedData.machineId,
        type: validatedData.type,
        qrData: validatedData.qrData,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        hash,
        prevHash: lastRecord?.hash
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_ATTENDANCE',
        resource: 'ATTENDANCE_RECORD',
        details: `Registro de ${validatedData.type} na máquina ${machine.name}`
      }
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Erro ao criar registro de ponto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
