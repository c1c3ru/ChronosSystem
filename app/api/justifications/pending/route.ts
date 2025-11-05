import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/justifications/pending - Buscar pendências que requerem justificativa

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar registros dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId: session.user.id,
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { timestamp: 'desc' }
    })

    // Buscar justificativas já enviadas (temporariamente vazio até Prisma atualizar)
    const existingJustifications: any[] = []
    
    const justificationDates = new Set(
      existingJustifications.map((j: any) => j.date.toDateString() + '-' + j.type)
    )

    const pendingIssues: any[] = []

    // Analisar registros para encontrar atrasos (entrada após 8:30)
    const entriesByDate = new Map()
    
    attendanceRecords.forEach(record => {
      const dateKey = record.timestamp.toDateString()
      
      if (record.type === 'ENTRY') {
        if (!entriesByDate.has(dateKey)) {
          entriesByDate.set(dateKey, [])
        }
        entriesByDate.get(dateKey).push(record)
      }
    })

    // Verificar atrasos (entrada após 8:30)
    entriesByDate.forEach((entries, dateKey) => {
      const firstEntry = entries.sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime())[0]
      const entryTime = firstEntry.timestamp
      const expectedTime = new Date(entryTime)
      expectedTime.setHours(8, 30, 0, 0)

      // Se entrada foi após 8:30 e atraso > 30 minutos
      if (entryTime > expectedTime) {
        const delayMinutes = (entryTime.getTime() - expectedTime.getTime()) / (1000 * 60)
        
        if (delayMinutes > 30) {
          const justificationKey = dateKey + '-LATE'
          
          if (!justificationDates.has(justificationKey)) {
            pendingIssues.push({
              id: `late-${firstEntry.id}`,
              date: firstEntry.timestamp.toISOString(),
              type: 'LATE',
              description: `Atraso de ${Math.round(delayMinutes)} minutos (entrada às ${entryTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`,
              canJustify: true
            })
          }
        }
      }
    })

    // Verificar faltas (dias sem registro de entrada)
    const today = new Date()
    const workDays = []
    
    // Gerar dias úteis dos últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Apenas dias úteis (segunda a sexta)
      if (date.getDay() >= 1 && date.getDay() <= 5 && date < today) {
        workDays.push(date.toDateString())
      }
    }

    // Verificar quais dias não têm registro de entrada
    workDays.forEach(dateKey => {
      if (!entriesByDate.has(dateKey)) {
        const justificationKey = dateKey + '-ABSENCE'
        
        if (!justificationDates.has(justificationKey)) {
          const date = new Date(dateKey)
          pendingIssues.push({
            id: `absence-${dateKey}`,
            date: date.toISOString(),
            type: 'ABSENCE',
            description: `Falta no dia ${date.toLocaleDateString('pt-BR')}`,
            canJustify: true
          })
        }
      }
    })

    // Ordenar por data (mais recentes primeiro)
    pendingIssues.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(pendingIssues)
  } catch (error) {
    console.error('Erro ao buscar pendências:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
