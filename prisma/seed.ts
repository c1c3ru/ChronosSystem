import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando configuração inicial do banco de dados...')

  // Limpar dados existentes (ordem importante por causa das foreign keys)
  await prisma.auditLog.deleteMany()
  await prisma.qrEvent.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.justification.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.user.deleteMany()

  // Criar apenas uma máquina padrão
  const defaultMachine = await prisma.machine.create({
    data: {
      name: 'Terminal Principal',
      location: 'Entrada Principal',
      isActive: true,
    },
  })

  // Criar log de auditoria da inicialização
  console.log('✅ Configuração inicial concluída!')
  console.log('\n🏢 Sistema pronto para uso')
  console.log(`📍 Máquina padrão: ${defaultMachine.name} - ${defaultMachine.location}`)
  console.log('\n📝 Para criar o primeiro usuário admin, use a interface web ou execute:')
  console.log('npx tsx scripts/create-admin.ts')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
