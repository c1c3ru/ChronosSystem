import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const saveDraftSchema = z.object({
  formType: z.string(),
  formData: z.record(z.any()),
})

/**
 * POST /api/forms/drafts
 * Salva um rascunho de formulário
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { formType, formData: parsedFormData } = saveDraftSchema.parse(body)
    const formData = JSON.stringify(parsedFormData)

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Salva ou atualiza o rascunho
    const draft = await prisma.formDraft.upsert({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
      update: {
        formData,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        formType,
        formData,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Rascunho salvo com sucesso',
        draft,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao salvar rascunho' }, { status: 500 })
  }
}

/**
 * GET /api/forms/drafts?formType=final-report
 * Recupera um rascunho de formulário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formType = request.nextUrl.searchParams.get('formType')

    if (!formType) {
      return NextResponse.json({ error: 'formType é obrigatório' }, { status: 400 })
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Busca o rascunho
    const draft = await prisma.formDraft.findUnique({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Rascunho não encontrado' }, { status: 404 })
    }

    // Converte formData de volta para objeto
    const parsedDraft = { ...draft, formData: JSON.parse(draft.formData) }

    return NextResponse.json(parsedDraft, { status: 200 })
  } catch (error) {
    console.error('Erro ao recuperar rascunho:', error)
    return NextResponse.json({ error: 'Erro ao recuperar rascunho' }, { status: 500 })
  }
}

/**
 * DELETE /api/forms/drafts?formType=final-report
 * Remove um rascunho de formulário
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formType = request.nextUrl.searchParams.get('formType')

    if (!formType) {
      return NextResponse.json({ error: 'formType é obrigatório' }, { status: 400 })
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Remove o rascunho
    await prisma.formDraft.delete({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
    })

    return NextResponse.json(
      { success: true, message: 'Rascunho removido com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover rascunho:', error)
    return NextResponse.json({ error: 'Erro ao remover rascunho' }, { status: 500 })
  }
}
      },
      create: {
        userId: user.id,
        formType,
        formData,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Rascunho salvo com sucesso',
        draft,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao salvar rascunho' }, { status: 500 })
  }
}

/**
 * GET /api/forms/drafts?formType=final-report
 * Recupera um rascunho de formulário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formType = request.nextUrl.searchParams.get('formType')

    if (!formType) {
      return NextResponse.json({ error: 'formType é obrigatório' }, { status: 400 })
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Busca o rascunho
    const draft = await prisma.formDraft.findUnique({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Rascunho não encontrado' }, { status: 404 })
    }

    return NextResponse.json(draft, { status: 200 })
  } catch (error) {
    console.error('Erro ao recuperar rascunho:', error)
    return NextResponse.json({ error: 'Erro ao recuperar rascunho' }, { status: 500 })
  }
}

/**
 * DELETE /api/forms/drafts?formType=final-report
 * Remove um rascunho de formulário
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formType = request.nextUrl.searchParams.get('formType')

    if (!formType) {
      return NextResponse.json({ error: 'formType é obrigatório' }, { status: 400 })
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Remove o rascunho
    await prisma.formDraft.delete({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
    })

    return NextResponse.json(
      { success: true, message: 'Rascunho removido com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao remover rascunho:', error)
    return NextResponse.json({ error: 'Erro ao remover rascunho' }, { status: 500 })
  }
}
