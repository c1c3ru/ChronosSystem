import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { determineRoleFromSiape } from '@/lib/admin-siape'
import { getContractTypeConfig } from '@/lib/contract-types'
import { getShiftStartTime } from '@/lib/shift-validation'
import { authLogger } from '@/lib/logger'

// POST /api/auth/complete-profile - Completar perfil após login com Google

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const {
      phone,
      address,
      birthDate,
      emergencyContact,
      emergencyPhone,
      department,
      startDate,
      contractStartDate,
      contractEndDate,
      siapeNumber,
      contractType,
      shift,
      workingDaysPerWeek,
      allowFlexibleHours,
    } = await request.json()

    // Validações básicas
    if (!phone || !address || !birthDate || !emergencyContact || !emergencyPhone) {
      return NextResponse.json(
        { error: 'Todos os campos básicos são obrigatórios' },
        { status: 400 }
      )
    }

    // Determinar role baseado na matrícula SIAPE (se fornecida)
    const newRole = siapeNumber ? determineRoleFromSiape(siapeNumber) : 'EMPLOYEE'
    authLogger.debug('SIAPE validation', { siape: siapeNumber || 'N/A', role: newRole })

    // Validações específicas para funcionários (não para ADMIN/SUPERVISOR)
    if (newRole === 'EMPLOYEE') {
      if (!department) {
        return NextResponse.json(
          { error: 'Departamento é obrigatório para funcionários' },
          { status: 400 }
        )
      }
    }

    // Validar formato da matrícula SIAPE (apenas se fornecida)
    if (siapeNumber && !/^\d{7}$/.test(siapeNumber)) {
      return NextResponse.json(
        { error: 'Matrícula SIAPE deve ter exatamente 7 dígitos' },
        { status: 400 }
      )
    }

    authLogger.debug('Updating user profile', { userId: session.user.id, role: newRole })

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    })

    if (!existingUser) {
      authLogger.error('User not found', { userId: session.user.id })
      return NextResponse.json(
        {
          error: 'Usuário não encontrado',
          message: 'Usuário não encontrado no banco de dados',
        },
        { status: 404 }
      )
    }

    // Determinar carga horária e horários de turno baseado no tipo de contrato e turno
    const finalContractType = newRole === 'EMPLOYEE' ? contractType || 'ESTAGIO_20H' : 'EMPREGO_40H'
    const contractConfig = getContractTypeConfig(finalContractType)
    const finalWeeklyHours = contractConfig?.weeklyHours || 20
    const finalDailyHours = contractConfig?.dailyHours || 4

    // Obter horários padrão do turno
    const finalShift = shift || 'MORNING'
    const shiftTimes = getShiftStartTime(finalShift as 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID')

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        address,
        birthDate: new Date(birthDate),
        emergencyContact,
        emergencyPhone,
        department: newRole === 'EMPLOYEE' ? department : 'DIRECAO_GERAL', // Padrão para ADMINs
        startDate: startDate ? new Date(startDate) : null,
        contractStartDate: contractStartDate ? new Date(contractStartDate) : null,
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        siapeNumber,
        contractType: finalContractType,
        weeklyHours: finalWeeklyHours,
        dailyHours: finalDailyHours,
        // Campos de turno
        shift: finalShift,
        shiftStartTime: shiftTimes.start,
        shiftEndTime: shiftTimes.end,
        workingDaysPerWeek: workingDaysPerWeek || 5,
        allowFlexibleHours: allowFlexibleHours || false,
        role: newRole, // Atualizar role baseado no SIAPE
        profileComplete: true,
        updatedAt: new Date(),
      },
    })

    authLogger.info('User profile updated successfully', {
      userId: updatedUser.id,
      role: updatedUser.role,
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'COMPLETE_PROFILE',
        resource: 'USER_PROFILE',
        details: `Perfil completado para usuário ${updatedUser.email}`,
      },
    })

    // Determinar URL de redirecionamento baseado no role
    const redirectUrl = ['ADMIN', 'SUPERVISOR'].includes(updatedUser.role) ? '/admin' : '/employee'

    return NextResponse.json({
      success: true,
      message: 'Perfil completado com sucesso',
      redirectUrl: redirectUrl,
      forceReload: true, // Flag para forçar reload completo
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    authLogger.error('Error completing profile', {
      userId: 'unknown',
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Erro ao salvar perfil',
        details: errorMessage,
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}
