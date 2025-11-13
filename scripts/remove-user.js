const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeUser() {
  try {
    // Pegar email do argumento da linha de comando ou usar padrão
    const email = process.argv[2] || 'cti.maracanau@ifce.edu.br'
    
    console.log(`🔍 Procurando usuário: ${email}`)
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileComplete: true,
        createdAt: true
      }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }
    
    console.log('📋 Usuário encontrado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Nome: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Perfil Completo: ${user.profileComplete}`)
    console.log(`   Criado em: ${user.createdAt}`)
    
    // Verificar registros relacionados
    const relatedData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        _count: {
          select: {
            attendanceRecords: true,
            auditLogs: true,
            justifications: true,
            accounts: true,
            sessions: true
          }
        }
      }
    })
    
    console.log('\n📊 Dados relacionados:')
    console.log(`   Registros de ponto: ${relatedData._count.attendanceRecords}`)
    console.log(`   Logs de auditoria: ${relatedData._count.auditLogs}`)
    console.log(`   Justificativas: ${relatedData._count.justifications}`)
    console.log(`   Contas OAuth: ${relatedData._count.accounts}`)
    console.log(`   Sessões: ${relatedData._count.sessions}`)
    
    // Remover o usuário (cascade vai remover dados relacionados)
    console.log('\n🗑️ Removendo usuário...')
    
    await prisma.user.delete({
      where: { id: user.id }
    })
    
    console.log('✅ Usuário removido com sucesso!')
    console.log('🔄 O usuário poderá fazer login novamente e completar o perfil corretamente.')
    
  } catch (error) {
    console.error('❌ Erro ao remover usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeUser()
