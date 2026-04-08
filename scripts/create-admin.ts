import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🔧 Criador de Usuário Administrador\n')

  // Verificar se já existe um admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    console.log('⚠️  Já existe um usuário administrador no sistema.')
    console.log(`📧 Email: ${existingAdmin.email}`)
    console.log(`👤 Nome: ${existingAdmin.name}`)
    
    const overwrite = await question('\nDeseja criar outro administrador? (s/N): ')
    if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'sim') {
      console.log('❌ Operação cancelada.')
      return
    }
  }

  // Coletar dados do novo admin
  const name = await question('👤 Nome completo: ')
  const email = await question('📧 Email: ')
  const password = await question('🔒 Senha: ')
  const department = await question('🏢 Departamento (opcional): ') || 'Administração'

  if (!name || !email || !password) {
    console.log('❌ Todos os campos obrigatórios devem ser preenchidos.')
    return
  }

  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('❌ Já existe um usuário com este email.')
    return
  }

  // Criar o usuário admin
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
      department,
      profileComplete: true,
    },
  })

  // Criar log de auditoria
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE_ADMIN',
      resource: 'USER',
      details: `Usuário administrador criado: ${email}`,
    },
  })

  console.log('\n✅ Usuário administrador criado com sucesso!')
  console.log(`👤 Nome: ${admin.name}`)
  console.log(`📧 Email: ${admin.email}`)
  console.log(`🏢 Departamento: ${admin.department}`)
  console.log('\n🚀 Você já pode fazer login no sistema!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar administrador:', e)
    process.exit(1)
  })
  .finally(async () => {
    rl.close()
    await prisma.$disconnect()
  })
