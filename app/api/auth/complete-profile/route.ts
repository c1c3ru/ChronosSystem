import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { determineRoleFromSiape } from '@/lib/admin-siape'

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
      weeklyHours
    } = await request.json()

    // Validações básicas
    if (!phone || !address || !birthDate || !emergencyContact || !emergencyPhone) {
      return NextResponse.json({ error: 'Todos os campos básicos são obrigatórios' }, { status: 400 })
    }

    // Determinar role baseado na matrícula SIAPE (se fornecida)
    const newRole = siapeNumber ? determineRoleFromSiape(siapeNumber) : 'EMPLOYEE'
    console.log(`🔍 [COMPLETE-PROFILE] SIAPE ${siapeNumber || 'N/A'} -> Role: ${newRole}`)

    // Validações específicas para funcionários (não para ADMIN/SUPERVISOR)
    if (newRole === 'EMPLOYEE') {
      if (!department) {
        return NextResponse.json({ error: 'Departamento é obrigatório para funcionários' }, { status: 400 })
      }
    }

    // Validar formato da matrícula SIAPE (apenas se fornecida)
    if (siapeNumber && !/^\d{7}$/.test(siapeNumber)) {
      return NextResponse.json({ error: 'Matrícula SIAPE deve ter exatamente 7 dígitos' }, { status: 400 })
    }

    // Validações específicas por role (usar newRole, não o role antigo da sessão)
    if (newRole === 'EMPLOYEE') {
      if (!startDate || !contractStartDate || !contractEndDate) {
        return NextResponse.json({ error: 'Funcionários devem preencher todas as datas' }, { status: 400 })
      }
    }

    console.log(`📝 [COMPLETE-PROFILE] Atualizando usuário ${session.user.id} com role: ${newRole}`)
    
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
        siapeNumber,
        contractType: newRole === 'EMPLOYEE' ? (contractType || 'ESTAGIO_20H') : 'EMPREGO_40H', // Padrão para ADMINs
        weeklyHours: newRole === 'EMPLOYEE' ? (weeklyHours || 20) : 40, // Padrão para ADMINs
        dailyHours: newRole === 'EMPLOYEE' ? 
          (weeklyHours ? Math.round((weeklyHours / 5) * 10) / 10 : 4) : 8, // Padrão para ADMINs
        role: newRole, // Atualizar role baseado no SIAPE
        profileComplete: true,
        updatedAt: new Date()
      }
    })
    
    console.log(`✅ [COMPLETE-PROFILE] Usuário atualizado:`, {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      profileComplete: updatedUser.profileComplete,
      siapeNumber: updatedUser.siapeNumber
    })

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'COMPLETE_PROFILE',
        resource: 'USER_PROFILE',
        details: `Perfil completado para usuário ${updatedUser.email}`
      }
    })

    // Determinar URL de redirecionamento baseado no role
    const redirectUrl = ['ADMIN', 'SUPERVISOR'].includes(updatedUser.role) ? '/admin' : '/employee'
    
    return NextResponse.json({ 
      success: true, 
      message: 'Perfil completado com sucesso',
      redirectUrl: redirectUrl,
      forceReload: true // Flag para forçar reload completo
    })
  } catch (error) {
    console.error('Erro ao completar perfil:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
