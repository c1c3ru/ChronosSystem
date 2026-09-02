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
 *
 * Alternativa sem terminal: POST /api/admin/students/backfill-registration-number
 * (protegida, ADMIN) roda a mesma lógica direto contra o banco de produção,
 * acionável pelo botão "Migrar Matrículas" em /admin/users.
 */
import { PrismaClient } from '@prisma/client'
import { backfillRegistrationNumbers } from '../lib/backfill-registration-numbers'

const prisma = new PrismaClient()

const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log('🔎 Buscando matrículas já digitadas em rascunhos de documentos (FormDraft)...\n')

  const result = await backfillRegistrationNumbers(prisma, isDryRun)

  console.log(
    `📄 ${result.totalDrafts} rascunho(s) encontrados; ${result.candidateCount} aluno(s) distinto(s) têm matrícula digitada em algum deles.\n`
  )

  if (result.candidateCount === 0) {
    console.log('Nada para migrar.')
    return
  }

  for (const detail of result.details) {
    if (detail.status === 'skipped_already_set') {
      console.log(`⏭️  ${detail.email}: já tem matrícula (${detail.registrationNumber}), mantendo.`)
    } else {
      console.log(
        `${isDryRun ? '🔍 [dry-run] ' : '✅ '}${detail.email}: matrícula "${detail.registrationNumber}" (do rascunho "${detail.sourceFormType}")`
      )
    }
  }

  console.log('\n📊 Resumo:')
  console.log(`   ${isDryRun ? 'Seriam atualizados' : 'Atualizados'}: ${result.updated}`)
  console.log(`   Já tinham matrícula (mantidos): ${result.skippedAlreadySet}`)

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
