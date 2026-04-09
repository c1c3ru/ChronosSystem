import { PrismaClient } from '@prisma/client'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🔐 Autorizar Usuário para Login Google\n')

  // Coletar dados do usuário
  const email = await question('📧 Email do usuário: ')
  const name = await question('👤 Nome completo: ')

  console.log('\n🎭 Selecione o perfil:')
  console.log('1. EMPLOYEE (Funcionário/Estagiário)')
  console.log('2. SUPERVISOR (Supervisor)')
  console.log('3. ADMIN (Administrador)')

  const roleChoice = await question('\nEscolha (1-3): ')

  let role: string
  switch (roleChoice) {
    case '1':
      role = 'EMPLOYEE'
      break
    case '2':
      role = 'SUPERVISOR'
      break
    case '3':
      role = 'ADMIN'
      break
    default:
      console.log('❌ Opção inválida. Usando EMPLOYEE como padrão.')
      role = 'EMPLOYEE'
  }

  const department = (await question('🏢 Departamento (opcional): ')) || 'Geral'

  if (!email || !name) {
    console.log('❌ Email e nome são obrigatórios.')
    return
  }

  // Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('⚠️  Usuário já existe!')
    console.log(`📧 Email: ${existingUser.email}`)
    console.log(`👤 Nome: ${existingUser.name}`)
    console.log(`🎭 Role: ${existingUser.role}`)

    const update = await question('\nDeseja atualizar o perfil? (s/N): ')
    if (update.toLowerCase() === 's' || update.toLowerCase() === 'sim') {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          role,
          department,
          profileComplete: true, // Usuários autorizados têm perfil completo
        },
      })

      console.log('\n✅ Usuário atualizado com sucesso!')
      console.log(`👤 Nome: ${updatedUser.name}`)
      console.log(`🎭 Role: ${updatedUser.role}`)
      console.log(`🏢 Departamento: ${updatedUser.department}`)
    } else {
      console.log('❌ Operação cancelada.')
    }
    return
  }

  // Criar novo usuário autorizado
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      role,
      department,
      profileComplete: true, // Usuários autorizados têm perfil completo
      // Não definir password - será usado apenas Google OAuth
    },
  })

  // Criar log de auditoria
  await prisma.auditLog.create({
    data: {
      userId: newUser.id,
      action: 'AUTHORIZE_GOOGLE_USER',
      resource: 'USER',
      details: `Usuário autorizado para Google Login: ${email} como ${role}`,
    },
  })

  console.log('\n✅ Usuário autorizado com sucesso!')
  console.log(`👤 Nome: ${newUser.name}`)
  console.log(`📧 Email: ${newUser.email}`)
  console.log(`🎭 Role: ${newUser.role}`)
  console.log(`🏢 Departamento: ${newUser.department}`)
  console.log('\n🚀 O usuário já pode fazer login com Google!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao autorizar usuário:', e)
    process.exit(1)
  })
  .finally(async () => {
    rl.close()
    await prisma.$disconnect()
  })
