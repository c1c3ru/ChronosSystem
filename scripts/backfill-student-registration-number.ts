/**
 * Preenche User.registrationNumber (matrícula do aluno) a partir do campo
 * "student_enrollment" já digitado em rascunhos de documentos (FormDraft) —
 * único lugar onde esse dado existia antes deste campo existir no perfil.
 *
 * Uso:
 *   npx tsx scripts/backfill-student-registration-number.ts --dry-run   (simula, não grava)
 *   npx tsx scripts/backfill-student-registration-number.ts             (aplica de fato)
 *
 * Rode com DATABASE_URL apontando para o banco que você quer migrar.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const isDryRun = process.argv.includes('--dry-run')

interface DraftCandidate {
  formType: string
  updatedAt: Date
  registrationNumber: string
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

async function main() {
  console.log('🔎 Buscando matrículas já digitadas em rascunhos de documentos (FormDraft)...\n')

  const drafts = await prisma.formDraft.findMany({
    select: { userId: true, formType: true, formData: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  // Um usuário pode ter um rascunho por tipo de documento; fica com a
  // matrícula do rascunho mais recente que tiver uma (drafts já vieram
  // ordenados por updatedAt desc, então o primeiro encontrado por usuário é
  // o mais recente).
  const bestByUser = new Map<string, DraftCandidate>()
  for (const draft of drafts) {
    if (bestByUser.has(draft.userId)) continue
    const registrationNumber = extractRegistrationNumber(draft.formData)
    if (registrationNumber) {
      bestByUser.set(draft.userId, {
        formType: draft.formType,
        updatedAt: draft.updatedAt,
        registrationNumber,
      })
    }
  }

  console.log(
    `📄 ${drafts.length} rascunho(s) encontrados; ${bestByUser.size} aluno(s) distinto(s) têm matrícula digitada em algum deles.\n`
  )

  if (bestByUser.size === 0) {
    console.log('Nada para migrar.')
    return
  }

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(bestByUser.keys()) } },
    select: { id: true, email: true, registrationNumber: true },
  })
  const userById = new Map(users.map((u) => [u.id, u]))

  let updated = 0
  let skippedAlreadySet = 0
  let skippedNotFound = 0

  for (const [userId, candidate] of bestByUser) {
    const user = userById.get(userId)
    if (!user) {
      skippedNotFound++
      continue
    }

    if (user.registrationNumber && user.registrationNumber.trim().length > 0) {
      skippedAlreadySet++
      console.log(`⏭️  ${user.email}: já tem matrícula (${user.registrationNumber}), mantendo.`)
      continue
    }

    console.log(
      `${isDryRun ? '🔍 [dry-run] ' : '✅ '}${user.email}: matrícula "${candidate.registrationNumber}" (do rascunho "${candidate.formType}")`
    )

    if (!isDryRun) {
      await prisma.user.update({
        where: { id: userId },
        data: { registrationNumber: candidate.registrationNumber },
      })
    }
    updated++
  }

  console.log('\n📊 Resumo:')
  console.log(`   ${isDryRun ? 'Seriam atualizados' : 'Atualizados'}: ${updated}`)
  console.log(`   Já tinham matrícula (mantidos): ${skippedAlreadySet}`)
  if (skippedNotFound > 0) {
    console.log(`   Usuário do rascunho não encontrado (conta removida?): ${skippedNotFound}`)
  }

  if (isDryRun) {
    console.log('\nModo dry-run: nenhuma alteração foi gravada. Rode sem --dry-run para aplicar.')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao migrar matrículas:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
