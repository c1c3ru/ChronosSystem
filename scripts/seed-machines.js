#!/usr/bin/env node

/**
 * Script para popular máquinas de teste no banco de dados
 * Uso: node scripts/seed-machines.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de máquinas...')

  const machines = [
    {
      id: 'machine-001',
      name: 'Máquina Entrada - Bloco A',
      location: 'Portaria Principal',
      isActive: true,
    },
    {
      id: 'machine-002',
      name: 'Máquina Saída - Bloco A',
      location: 'Portaria Principal',
      isActive: true,
    },
    {
      id: 'machine-003',
      name: 'Máquina Entrada - Bloco B',
      location: 'Bloco B - Térreo',
      isActive: true,
    },
    {
      id: 'machine-004',
      name: 'Máquina Saída - Bloco B',
      location: 'Bloco B - Térreo',
      isActive: true,
    },
    {
      id: 'machine-005',
      name: 'Máquina Entrada - Bloco C',
      location: 'Bloco C - Entrada',
      isActive: true,
    },
    {
      id: 'machine-006',
      name: 'Máquina Saída - Bloco C',
      location: 'Bloco C - Saída',
      isActive: true,
    },
  ]

  for (const machine of machines) {
    try {
      const existing = await prisma.machine.findUnique({
        where: { id: machine.id },
      })

      if (existing) {
        console.log(`⏭️  Máquina ${machine.id} já existe, pulando...`)
        continue
      }

      const created = await prisma.machine.create({
        data: machine,
      })

      console.log(`✅ Máquina criada: ${created.name} (${created.id})`)
    } catch (error) {
      console.error(`❌ Erro ao criar máquina ${machine.id}:`, error.message)
    }
  }

  console.log('🌱 Seed de máquinas concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
