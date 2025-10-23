import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/auth/complete-profile - Completar perfil após login com Google
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
      startDate
    } = await request.json()

    // Validações
    if (!phone || !address || !birthDate || !emergencyContact || !emergencyPhone || !department || !startDate) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Atualizar usuário (usando any para contornar problema temporário do Prisma)
    const updatedUser = await (prisma.user as any).update({
      where: { id: session.user.id },
      data: {
        phone,
        address,
        birthDate: new Date(birthDate),
        emergencyContact,
        emergencyPhone,
        department,
        startDate: new Date(startDate),
        profileComplete: true,
        updatedAt: new Date()
      }
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
