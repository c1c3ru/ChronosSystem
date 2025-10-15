import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ponto.com' },
    update: {},
    create: {
      email: 'admin@ponto.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar usuário supervisor
  const supervisorPassword = await bcrypt.hash('supervisor123', 10);
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@ponto.com' },
    update: {},
    create: {
      email: 'supervisor@ponto.com',
      name: 'Supervisor',
      password: supervisorPassword,
      role: 'SUPERVISOR',
    },
  });
  console.log('✅ Supervisor criado:', supervisor.email);

  // Criar estagiário de teste
  const estagioPassword = await bcrypt.hash('estagio123', 10);
  const estagiario = await prisma.user.upsert({
    where: { email: 'estagiario@ponto.com' },
    update: {},
    create: {
      email: 'estagiario@ponto.com',
      name: 'João Silva',
      password: estagioPassword,
      role: 'ESTAGIARIO',
    },
  });
  console.log('✅ Estagiário criado:', estagiario.email);

  // Criar máquina de ponto
  const machine = await prisma.machine.upsert({
    where: { publicId: 'MACHINE_001' },
    update: {},
    create: {
      name: 'Recepção Principal',
      location: 'Entrada do escritório',
      timezone: 'America/Sao_Paulo',
      publicId: 'MACHINE_001',
    },
  });
  console.log('✅ Máquina criada:', machine.name);

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
