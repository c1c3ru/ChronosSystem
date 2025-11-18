import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/employee/dashboard - Dashboard do funcionário
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Employee dashboard - Verificando sessão...')
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ [API] Employee dashboard - Sessão não encontrada')
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    console.log('✅ [API] Employee dashboard - Usuário autenticado:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    })

    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Buscar último registro do usuário
    const lastRecord = await prisma.attendanceRecord.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      }
    })

    // Verificar se está trabalhando (último registro foi entrada)
    const isWorking = lastRecord?.type === 'ENTRY'

    // Calcular horas trabalhadas hoje
    const todayRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Calcular total de horas hoje
    let todayHours = '0h 00min'
    if (todayRecords.length >= 2) {
      const entries = todayRecords.filter(r => r.type === 'ENTRY')
      const exits = todayRecords.filter(r => r.type === 'EXIT')
      
      let totalMinutes = 0
      for (let i = 0; i < Math.min(entries.length, exits.length); i++) {
        const entryTime = entries[i].timestamp.getTime()
        const exitTime = exits[i].timestamp.getTime()
        totalMinutes += (exitTime - entryTime) / (1000 * 60)
      }
      
      const hours = Math.floor(totalMinutes / 60)
      const minutes = Math.floor(totalMinutes % 60)
      todayHours = `${hours}h ${minutes.toString().padStart(2, '0')}min`
    }

    // Buscar registros recentes (últimos 7 dias)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: sevenDaysAgo
        }
      },
      include: {
        machine: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      workStatus: {
        isWorking,
        lastRecord: lastRecord ? {
          type: lastRecord.type,
          time: lastRecord.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          location: lastRecord.machine.location
        } : null,
        todayHours
      },
      recentRecords: recentRecords.map((record: any) => ({
        id: record.id,
        timestamp: record.timestamp,
        type: record.type,
        machine: record.machine,
        date: record.timestamp.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        }),
        time: record.timestamp.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        workStatus: {
          isWorking: false,
          lastRecord: null,
          todayHours: '0h 00min'
        },
        recentRecords: []
      }, 
      { status: 500 }
    )
  }
}
