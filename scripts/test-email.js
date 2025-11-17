// Script para testar o sistema de email com Nodemailer
// Execute com: node scripts/test-email.js

const { emailService } = require('../lib/email.ts')

async function testEmailSystem() {
  console.log('📧 Testando Sistema de Email com Nodemailer\n')

  try {
    // 1. Testar envio de email simples
    console.log('1. Testando envio de email simples...')
    
    const simpleEmailResult = await emailService.sendEmail({
      to: 'teste@example.com',
      subject: 'Teste do Sistema Chronos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">🧪 Teste do Sistema de Email</h2>
          <p>Este é um email de teste do sistema Chronos.</p>
          <p>Se você está vendo isso, o Nodemailer está funcionando corretamente!</p>
          <hr>
          <p style="color: #6b7280; font-size: 12px;">
            Enviado em: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `,
      text: `
        Teste do Sistema de Email - Chronos
        
        Este é um email de teste do sistema Chronos.
        Se você está vendo isso, o Nodemailer está funcionando corretamente!
        
        Enviado em: ${new Date().toLocaleString('pt-BR')}
      `
    })

    if (simpleEmailResult) {
      console.log('   ✅ Email simples enviado com sucesso!')
    } else {
      console.log('   ❌ Falha no envio do email simples')
    }

    // 2. Testar email de reset de senha
    console.log('\n2. Testando email de reset de senha...')
    
    const resetEmailResult = await emailService.sendPasswordResetEmail({
      userName: 'João Silva',
      userEmail: 'joao@example.com',
      resetUrl: 'http://localhost:5000/auth/reset-password?token=abc123def456',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      reason: 'Teste do sistema de reset de senha'
    })

    if (resetEmailResult) {
      console.log('   ✅ Email de reset enviado com sucesso!')
    } else {
      console.log('   ❌ Falha no envio do email de reset')
    }

    // 3. Testar notificação para administrador
    console.log('\n3. Testando notificação para administrador...')
    
    const adminNotificationResult = await emailService.sendMassPasswordResetNotification(
      'admin@chronos.com',
      5,
      'Teste de reset em massa'
    )

    if (adminNotificationResult) {
      console.log('   ✅ Notificação para admin enviada com sucesso!')
    } else {
      console.log('   ❌ Falha no envio da notificação para admin')
    }

    // 4. Verificar configuração
    console.log('\n4. Verificando configuração...')
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'Não configurado (usando Ethereal)'}`)
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '587 (padrão)'}`)
    console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'Não configurado (usando Ethereal)'}`)
    console.log(`   SMTP_FROM: ${process.env.SMTP_FROM || process.env.SMTP_USER || 'Padrão'}`)

    console.log('\n🎉 Teste de email concluído!')
    
    if (!process.env.SMTP_USER) {
      console.log('\n💡 Dicas para configurar email em produção:')
      console.log('   1. Configure as variáveis de ambiente SMTP no .env')
      console.log('   2. Para Gmail, use uma senha de app (não sua senha normal)')
      console.log('   3. Para outros provedores, consulte a documentação SMTP')
      console.log('   4. Teste sempre em ambiente de desenvolvimento primeiro')
    }

  } catch (error) {
    console.error('❌ Erro durante o teste de email:', error)
  }
}

// Executar teste
testEmailSystem().catch(console.error)
