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
