import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (ordem importante por causa das foreign keys)
  await prisma.auditLog.deleteMany()
  await prisma.qrEvent.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.justification.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@chronos.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Administração',
      profileComplete: true,
    },
  })

  // Criar supervisor
  const supervisorPassword = await bcrypt.hash('supervisor123', 10)
  const supervisor = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'supervisor@chronos.com',
      password: supervisorPassword,
      role: 'SUPERVISOR',
      department: 'Supervisão',
      phone: '(11) 99999-1234',
      profileComplete: true,
    },
  })

  // Criar estagiários de exemplo
  const employeePassword = await bcrypt.hash('employee123', 10)
  
  const employee1 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@chronos.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      department: 'TI',
      startDate: new Date('2024-01-15'),
      phone: '(11) 99999-5678',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      birthDate: new Date('1995-03-15'),
      emergencyContact: 'Ana Santos',
      emergencyPhone: '(11) 88888-1234',
      profileComplete: true,
    },
  })

  const employee2 = await prisma.user.create({
    data: {
      name: 'Pedro Oliveira',
      email: 'pedro@chronos.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      department: 'Desenvolvimento',
      startDate: new Date('2024-02-01'),
      phone: '(11) 99999-9012',
      address: 'Av. Paulista, 456 - São Paulo, SP',
      birthDate: new Date('1992-07-22'),
      emergencyContact: 'Carlos Oliveira',
      emergencyPhone: '(11) 77777-5678',
      profileComplete: true,
    },
  })

  // Criar máquinas
  const machine1 = await prisma.machine.create({
    data: {
      name: 'Recepção Principal',
      location: 'Térreo - Entrada Principal',
      isActive: true,
    },
  })

  const machine2 = await prisma.machine.create({
    data: {
      name: 'Laboratório TI',
      location: '2º Andar - Sala 201',
      isActive: true,
    },
  })

  // Criar alguns registros de exemplo
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  await prisma.attendanceRecord.create({
    data: {
      userId: employee1.id,
      machineId: machine1.id,
      type: 'ENTRY',
      timestamp: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), // 8h ontem
      qrData: 'sample-qr-data-1',
      hash: 'sample-hash-1',
      latitude: -23.5505,
      longitude: -46.6333,
    },
  })

  await prisma.attendanceRecord.create({
    data: {
      userId: employee1.id,
      machineId: machine1.id,
      type: 'EXIT',
      timestamp: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000), // 17h ontem
      qrData: 'sample-qr-data-2',
      hash: 'sample-hash-2',
      prevHash: 'sample-hash-1',
      latitude: -23.5505,
      longitude: -46.6333,
    },
  })

  // Criar log de auditoria
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_DATABASE',
      resource: 'DATABASE',
      details: 'Banco de dados inicializado com dados de exemplo',
    },
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📋 Usuários criados:')
  console.log(`👤 Admin: admin@chronos.com / admin123`)
  console.log(`👤 Supervisor: supervisor@chronos.com / supervisor123`)
  console.log(`👤 Estagiário 1: maria@chronos.com / employee123`)
  console.log(`👤 Estagiário 2: pedro@chronos.com / employee123`)
  console.log('\n🏢 Máquinas criadas:')
  console.log(`📍 ${machine1.name} - ${machine1.location}`)
  console.log(`📍 ${machine2.name} - ${machine2.location}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
