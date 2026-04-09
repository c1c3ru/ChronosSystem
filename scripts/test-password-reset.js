// Script para testar o sistema de reset de senha
// Execute com: node scripts/test-password-reset.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function testPasswordReset() {
  console.log('🧪 Testando Sistema de Reset de Senha\n')

  try {
    // 1. Verificar usuários existentes
    console.log('1. Verificando usuários com senha...')
    const usersWithPassword = await prisma.user.findMany({
      where: {
        password: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    console.log(`   ✅ Encontrados ${usersWithPassword.length} usuários com senha`)
    usersWithPassword.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`)
    })

    if (usersWithPassword.length === 0) {
      console.log('   ⚠️  Nenhum usuário com senha encontrado. Criando usuário de teste...')

      const testUser = await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: 'teste@chronos.com',
          password: await bcrypt.hash('senha123', 10),
          role: 'EMPLOYEE',
          profileComplete: true,
        },
      })

      console.log(`   ✅ Usuário de teste criado: ${testUser.email}`)
      usersWithPassword.push(testUser)
    }

    // 2. Criar token de reset para o primeiro usuário
    console.log('\n2. Criando token de reset...')
    const testUser = usersWithPassword[0]
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        userId: testUser.id,
        expires: expiresAt,
      },
    })

    console.log(`   ✅ Token criado para ${testUser.email}`)
    console.log(`   📝 Token: ${token}`)
    console.log(`   ⏰ Expira em: ${expiresAt.toLocaleString('pt-BR')}`)
    console.log(`   🔗 URL de reset: http://localhost:5000/auth/reset-password?token=${token}`)

    // 3. Verificar tokens ativos
    console.log('\n3. Verificando tokens ativos...')
    const activeTokens = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expires: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    console.log(`   ✅ ${activeTokens.length} token(s) ativo(s)`)
    activeTokens.forEach((token) => {
      console.log(
        `   - ${token.user.name} (${token.user.email}) - Expira: ${token.expires.toLocaleString('pt-BR')}`
      )
    })

    // 4. Testar validação de token
    console.log('\n4. Testando validação de token...')
    const validationTest = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (validationTest && !validationTest.used && validationTest.expires > new Date()) {
      console.log('   ✅ Token válido!')
      console.log(`   👤 Usuário: ${validationTest.user.name}`)
      console.log(`   📧 Email: ${validationTest.user.email}`)
    } else {
      console.log('   ❌ Token inválido ou expirado')
    }

    // 5. Simular uso do token (alterar senha)
    console.log('\n5. Simulando alteração de senha...')
    const newPassword = 'novaSenha123'
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: testUser.id },
      data: { password: hashedNewPassword },
    })

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true, usedAt: new Date() },
    })

    console.log('   ✅ Senha alterada com sucesso!')
    console.log(`   🔒 Nova senha: ${newPassword}`)

    // 6. Verificar logs de auditoria
    console.log('\n6. Verificando logs de auditoria...')
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: 'PASSWORD_RESET_COMPLETED' },
          { action: 'MASS_PASSWORD_RESET' },
          { action: 'INDIVIDUAL_PASSWORD_RESET' },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: 5,
    })

    console.log(`   ✅ ${auditLogs.length} log(s) de reset encontrado(s)`)
    auditLogs.forEach((log) => {
      console.log(`   - ${log.action}: ${log.details} (${log.timestamp.toLocaleString('pt-BR')})`)
    })

    console.log('\n🎉 Teste concluído com sucesso!')
    console.log('\n📋 Resumo dos endpoints disponíveis:')
    console.log('   • POST /api/admin/password-reset - Criar resets')
    console.log('   • GET  /api/admin/password-reset - Listar tokens ativos')
    console.log('   • DELETE /api/admin/password-reset - Invalidar tokens')
    console.log('   • POST /api/auth/reset-password - Processar reset')
    console.log('   • GET  /api/auth/reset-password - Validar token')
    console.log('   • POST /api/admin/send-reset-emails - Enviar emails')
    console.log('\n🌐 Páginas disponíveis:')
    console.log('   • /admin/password-reset - Interface administrativa')
    console.log('   • /auth/reset-password?token=XXX - Página de reset do usuário')
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testPasswordReset().catch(console.error)
