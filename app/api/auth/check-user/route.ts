import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/auth/check-user?email=user@example.com
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Buscar usuário no banco
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileComplete: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (existingUser) {
      return NextResponse.json({
        exists: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          profileComplete: existingUser.profileComplete,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt
        },
        message: existingUser.profileComplete 
          ? 'Usuário já cadastrado e com perfil completo'
          : 'Usuário já cadastrado mas precisa completar o perfil'
      })
    }

    return NextResponse.json({
      exists: false,
      message: 'Usuário não encontrado'
    })

  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
