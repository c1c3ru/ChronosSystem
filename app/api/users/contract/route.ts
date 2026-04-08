import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Configurações de contrato conforme Lei 11.788/2008

// Force dynamic rendering
export const dynamic = 'force-dynamic'
const CONTRACT_CONFIGS = {
  FUNDAMENTAL_20H: { 
    dailyHours: 4, 
    weeklyHours: 20,
    description: 'Ensino Fundamental - 4h diárias, 20h semanais'
  },
  SUPERIOR_30H: { 
    dailyHours: 6, 
    weeklyHours: 30,
    description: 'Superior/Médio/Técnico - 6h diárias, 30h semanais'
  },
  ALTERNANCIA_40H: { 
    dailyHours: 8, 
    weeklyHours: 40,
    description: 'Cursos Alternância - 8h diárias, 40h semanais (períodos sem aulas)'
  },
  CUSTOM: { 
    dailyHours: 6, 
    weeklyHours: 30,
    description: 'Personalizado - Definido manualmente'
  }
}

// GET /api/users/contract - Buscar configurações de contrato
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Verificar permissões
    if (userId !== session.user.id && !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar dados do usuário
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        contractType: true,
        weeklyHours: true,
        dailyHours: true,
        hourBalance: true,
        startDate: true,
        department: true
      } as any
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      user,
      availableContracts: CONTRACT_CONFIGS,
      currentConfig: CONTRACT_CONFIGS[(user as any).contractType as keyof typeof CONTRACT_CONFIGS] || CONTRACT_CONFIGS.CUSTOM
    })
  } catch (error) {
    console.error('❌ [CONTRACT] Erro ao buscar contrato:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/users/contract - Atualizar tipo de contrato
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas ADMIN e SUPERVISOR podem alterar contratos
    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão para alterar contratos' }, { status: 403 })
    }

    const { userId, contractType, customDailyHours, customWeeklyHours } = await request.json()

    if (!userId || !contractType) {
      return NextResponse.json({ error: 'userId e contractType são obrigatórios' }, { status: 400 })
    }

    // Validar tipo de contrato
    if (!Object.keys(CONTRACT_CONFIGS).includes(contractType)) {
      return NextResponse.json({ error: 'Tipo de contrato inválido' }, { status: 400 })
    }

    // Buscar usuário
    const user = await (prisma.user as any).findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Definir horas baseado no tipo de contrato
    let dailyHours: number
    let weeklyHours: number

    if (contractType === 'CUSTOM') {
      if (!customDailyHours || !customWeeklyHours) {
        return NextResponse.json({ 
          error: 'Para contrato personalizado, customDailyHours e customWeeklyHours são obrigatórios' 
        }, { status: 400 })
      }
      
      // Validar limites legais
      if (customDailyHours > 6 || customWeeklyHours > 30) {
        return NextResponse.json({ 
          error: 'Limites legais: máximo 6h diárias e 30h semanais (Lei 11.788/2008)' 
        }, { status: 400 })
      }
      
      dailyHours = customDailyHours
      weeklyHours = customWeeklyHours
    } else {
      const config = CONTRACT_CONFIGS[contractType as keyof typeof CONTRACT_CONFIGS]
      dailyHours = config.dailyHours
      weeklyHours = config.weeklyHours
    }

    // Atualizar contrato do usuário
    const updatedUser = await (prisma.user as any).update({
      where: { id: userId },
      data: {
        contractType,
        dailyHours,
        weeklyHours
      } as any
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_CONTRACT',
        resource: 'USER',
        details: `Contrato alterado para ${user.name}: ${contractType} (${dailyHours}h/dia, ${weeklyHours}h/semana)`
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        contractType: (updatedUser as any).contractType,
        dailyHours: (updatedUser as any).dailyHours,
        weeklyHours: (updatedUser as any).weeklyHours
      },
      config: CONTRACT_CONFIGS[contractType as keyof typeof CONTRACT_CONFIGS]
    })
  } catch (error) {
    console.error('❌ [CONTRACT] Erro ao atualizar contrato:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/users/contract/validate - Validar configuração de contrato
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { contractType, dailyHours, weeklyHours, studentLevel } = await request.json()

    if (!contractType) {
      return NextResponse.json({ error: 'Tipo de contrato é obrigatório' }, { status: 400 })
    }

    let validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      recommendations: [] as string[]
    }

    // Validações baseadas na Lei 11.788/2008
    switch (contractType) {
      case 'FUNDAMENTAL_20H':
        if (dailyHours > 4) {
          validation.errors.push('Ensino fundamental: máximo 4 horas diárias')
          validation.isValid = false
        }
        if (weeklyHours > 20) {
          validation.errors.push('Ensino fundamental: máximo 20 horas semanais')
          validation.isValid = false
        }
        break

      case 'SUPERIOR_30H':
        if (dailyHours > 6) {
          validation.errors.push('Ensino superior/médio/técnico: máximo 6 horas diárias')
          validation.isValid = false
        }
        if (weeklyHours > 30) {
          validation.errors.push('Ensino superior/médio/técnico: máximo 30 horas semanais')
          validation.isValid = false
        }
        break

      case 'ALTERNANCIA_40H':
        if (dailyHours > 8) {
          validation.errors.push('Cursos alternância: máximo 8 horas diárias')
          validation.isValid = false
        }
        if (weeklyHours > 40) {
          validation.errors.push('Cursos alternância: máximo 40 horas semanais')
          validation.isValid = false
        }
        validation.warnings.push('Aplicável apenas durante períodos sem aulas presenciais')
        break

      case 'CUSTOM':
        if (dailyHours > 6) {
          validation.errors.push('Limite legal geral: máximo 6 horas diárias')
          validation.isValid = false
        }
        if (weeklyHours > 30) {
          validation.errors.push('Limite legal geral: máximo 30 horas semanais')
          validation.isValid = false
        }
        break
    }

    // Validações gerais
    if (dailyHours && weeklyHours) {
      const maxWeeklyFromDaily = dailyHours * 5 // Assumindo 5 dias úteis
      if (weeklyHours > maxWeeklyFromDaily) {
        validation.warnings.push(`Com ${dailyHours}h diárias, máximo recomendado: ${maxWeeklyFromDaily}h semanais`)
      }
    }

    // Recomendações
    if (weeklyHours && weeklyHours < 12) {
      validation.recommendations.push('Considere aumentar a carga horária para melhor aproveitamento do estágio')
    }

    if (dailyHours && dailyHours < 4) {
      validation.recommendations.push('Carga horária diária baixa pode limitar as atividades de aprendizado')
    }

    return NextResponse.json({
      validation,
      legalReference: {
        law: 'Lei 11.788/2008 - Lei do Estágio',
        article: 'Art. 10',
        limits: {
          fundamental: '4h diárias, 20h semanais',
          superior: '6h diárias, 30h semanais',
          alternancia: '8h diárias, 40h semanais (sem aulas)'
        }
      }
    })
  } catch (error) {
    console.error('❌ [CONTRACT] Erro ao validar contrato:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
