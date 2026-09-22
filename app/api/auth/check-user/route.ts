import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimiters, withRateLimit } from '@/lib/rate-limit'

// GET /api/auth/check-user?email=user@example.com
export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(rateLimiters.general)(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Endpoint desautenticado por design (usado pela tela de login para
    // decidir "entrar" vs "cadastrar"), então a resposta não deve incluir
    // nada além disso — devolver name/role/id/timestamps aqui permitiria
    // enumerar usuários e descobrir quem é ADMIN sem autenticação.
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { profileComplete: true },
    })

    if (existingUser) {
      return NextResponse.json({
        exists: true,
        message: existingUser.profileComplete
          ? 'Usuário já cadastrado e com perfil completo'
          : 'Usuário já cadastrado mas precisa completar o perfil',
      })
    }

    return NextResponse.json({
      exists: false,
      message: 'Usuário não encontrado',
    })
  } catch (error: unknown) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
