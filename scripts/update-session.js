// Script para forçar atualização de sessão
// Execute este script e depois faça refresh na página

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateUserSession() {
  try {
    // Atualizar o usuário OAuth para forçar nova sessão
    const user = await prisma.user.update({
      where: { email: 'cicero.silva@ifce.edu.br' },
      data: {
        updatedAt: new Date(), // Força update para trigger session refresh
      },
    })

    console.log('✅ Sessão do usuário atualizada:', user.email)
    console.log('🔄 Faça logout e login novamente para ver as mudanças')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserSession()
