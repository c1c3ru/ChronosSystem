import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Forçar atualização da sessão
    // Isso fará com que o callback JWT seja chamado novamente
    return NextResponse.json({ 
      success: true, 
      message: 'Sessão atualizada. Faça refresh da página.',
      user: session.user 
    })
    
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
