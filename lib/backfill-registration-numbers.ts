import type { PrismaClient } from '@prisma/client'

export interface BackfillDetail {
  userId: string
  email: string
  status: 'updated' | 'would_update' | 'skipped_already_set'
  registrationNumber: string
  sourceFormType: string
}

export interface BackfillResult {
  totalDrafts: number
  candidateCount: number
  updated: number
  skippedAlreadySet: number
  details: BackfillDetail[]
}

function extractRegistrationNumber(formDataRaw: string): string | null {
  try {
    const parsed = JSON.parse(formDataRaw) as Record<string, unknown>
    const value = parsed.student_enrollment
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
    return null
  } catch {
    return null
  }
}

/**
 * Preenche User.registrationNumber (matrícula do aluno) a partir do campo
 * "student_enrollment" já digitado em rascunhos de documentos (FormDraft) —
 * único lugar onde esse dado existia antes de virar um campo de perfil.
 * Nunca sobrescreve um usuário que já tenha registrationNumber preenchido.
 *
 * Usado tanto pelo script de linha de comando (scripts/backfill-student-registration-number.ts)
 * quanto pela rota POST /api/admin/students/backfill-registration-number — por isso recebe o
 * PrismaClient por parâmetro em vez de importar um singleton fixo.
 */
export async function backfillRegistrationNumbers(
  prisma: PrismaClient,
  dryRun: boolean
): Promise<BackfillResult> {
  const drafts = await prisma.formDraft.findMany({
    select: { userId: true, formType: true, formData: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  // Um usuário pode ter um rascunho por tipo de documento; fica com a
  // matrícula do rascunho mais recente que tiver uma (drafts já vieram
  // ordenados por updatedAt desc, então o primeiro encontrado por usuário é
  // o mais recente).
  const bestByUser = new Map<string, { formType: string; registrationNumber: string }>()
  for (const draft of drafts) {
    if (bestByUser.has(draft.userId)) continue
    const registrationNumber = extractRegistrationNumber(draft.formData)
    if (registrationNumber) {
      bestByUser.set(draft.userId, { formType: draft.formType, registrationNumber })
    }
  }

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(bestByUser.keys()) } },
    select: { id: true, email: true, registrationNumber: true },
  })
  const userById = new Map(users.map((u) => [u.id, u]))

  const details: BackfillDetail[] = []
  let updated = 0
  let skippedAlreadySet = 0

  for (const [userId, candidate] of bestByUser) {
    const user = userById.get(userId)
    if (!user) continue

    if (user.registrationNumber && user.registrationNumber.trim().length > 0) {
      skippedAlreadySet++
      details.push({
        userId,
        email: user.email,
        status: 'skipped_already_set',
        registrationNumber: user.registrationNumber,
        sourceFormType: candidate.formType,
      })
      continue
    }

    if (!dryRun) {
      await prisma.user.update({
        where: { id: userId },
        data: { registrationNumber: candidate.registrationNumber },
      })
    }

    updated++
    details.push({
      userId,
      email: user.email,
      status: dryRun ? 'would_update' : 'updated',
      registrationNumber: candidate.registrationNumber,
      sourceFormType: candidate.formType,
    })
  }

  return {
    totalDrafts: drafts.length,
    candidateCount: bestByUser.size,
    updated,
    skippedAlreadySet,
    details,
  }
}
