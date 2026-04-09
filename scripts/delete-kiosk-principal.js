#!/usr/bin/env node

/**
 * Script para deletar a máquina "Kiosk Principal" criada automaticamente
 * Uso: node scripts/delete-kiosk-principal.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Deletando máquina "Kiosk Principal"...')

  try {
    const result = await prisma.machine.deleteMany({
      where: {
        name: 'Kiosk Principal',
      },
    })

    console.log(`✅ ${result.count} máquina(s) deletada(s)`)
  } catch (error) {
    console.error('❌ Erro ao deletar máquina:', error.message)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
