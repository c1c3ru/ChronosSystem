import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const saveDraftSchema = z.object({
  formType: z.string(),
  formData: z.record(z.unknown()),
})

/**
 * POST /api/forms/drafts
 * Salva ou atualiza um rascunho
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { formType, formData: parsedFormData } = saveDraftSchema.parse(body)
    const formDataString = JSON.stringify(parsedFormData)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const draft = await prisma.formDraft.upsert({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
      update: {
        formData: formDataString,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        formType,
        formData: formDataString,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ success: true, draft }, { status: 200 })
  } catch (error: unknown) {
    console.error('Erro ao salvar rascunho:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao salvar rascunho' }, { status: 500 })
  }
}

/**
 * GET /api/forms/drafts
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

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

    // Correção do erro de tipo: Garantimos que formData seja string antes do parse
    const rawData =
      typeof draft.formData === 'string' ? draft.formData : JSON.stringify(draft.formData)

    const parsedDraft = { ...draft, formData: JSON.parse(rawData) }

    return NextResponse.json(parsedDraft, { status: 200 })
  } catch (error: unknown) {
    console.error('Erro ao recuperar rascunho:', error)
    return NextResponse.json({ error: 'Erro ao recuperar rascunho' }, { status: 500 })
  }
}

/**
 * DELETE /api/forms/drafts
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    await prisma.formDraft.delete({
      where: {
        userId_formType: {
          userId: user.id,
          formType,
        },
      },
    })

    return NextResponse.json({ success: true, message: 'Removido' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Erro ao remover rascunho:', error)
    return NextResponse.json({ error: 'Erro ao remover rascunho' }, { status: 500 })
  }
}
