import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createQuickAdmin() {
  try {
    console.log('🚀 Criando usuário administrador...')
    
    // Substitua pelo seu email Google
    const adminEmail = 'seu-email@gmail.com' // ALTERE AQUI
    const adminName = 'Administrador'
    const adminPassword = 'admin123' // Senha temporária
    
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existing) {
      console.log('✅ Usuário já existe:', adminEmail)
      console.log('🔑 Role:', existing.role)
      return
    }
    
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Administração',
        profileComplete: true,
      },
    })
    
    console.log('✅ Administrador criado com sucesso!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Role:', admin.role)
    console.log('🚀 Agora você pode fazer login com Google!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createQuickAdmin()
