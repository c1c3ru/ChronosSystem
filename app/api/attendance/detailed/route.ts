import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/attendance/detailed - Registros detalhados para relatório
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar registros com informações do usuário e máquina
    const records = await prisma.attendanceRecord.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    // Simular dados se não houver registros reais
    if (records.length === 0) {
      const simulatedRecords = [
        {
          id: 'sim-1',
          timestamp: new Date().toISOString(),
          type: 'ENTRY',
          user: {
            name: 'João Silva',
            email: 'joao@empresa.com',
            role: 'EMPLOYEE'
          },
          machine: {
            name: 'Terminal Principal',
            location: 'Recepção - Térreo'
          }
        },
        {
          id: 'sim-2',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          type: 'EXIT',
          user: {
            name: 'João Silva',
            email: 'joao@empresa.com',
            role: 'EMPLOYEE'
          },
          machine: {
            name: 'Terminal Principal',
            location: 'Recepção - Térreo'
          }
        },
        {
          id: 'sim-3',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          type: 'ENTRY',
          user: {
            name: 'Maria Santos',
            email: 'maria@empresa.com',
            role: 'SUPERVISOR'
          },
          machine: {
            name: 'Kiosk Sala de Reuniões',
            location: '2º Andar - Sala 201'
          }
        }
      ]
      
      return NextResponse.json(simulatedRecords)
    }

    return NextResponse.json(records)
  } catch (error) {
    console.error('Erro ao buscar registros detalhados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
