import { emailService } from '@/lib/email'

async function runEmailDiagnostics() {
  console.log('📧 Testando pipeline de emails do Chronos\n')

  try {
    console.log('1️⃣ Enviando email HTML simples...')
    const simpleEmailResult = await emailService.sendEmail({
      to: process.env.TEST_EMAIL_TO || 'teste@example.com',
      subject: 'Teste do Sistema Chronos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">🧪 Teste do Sistema de Email</h2>
          <p>Este é um email de teste enviado via Nodemailer + SMTP configurado no Chronos.</p>
          <p style="color: #6b7280; font-size: 12px;">${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
      text: 'Teste do Sistema Chronos - verifique o HTML na caixa de entrada.'
    })
    console.log(simpleEmailResult ? '   ✅ Email simples enviado!' : '   ❌ Falha no email simples')

    console.log('\n2️⃣ Enviando email de reset de senha...')
    const resetResult = await emailService.sendPasswordResetEmail({
      userName: 'Usuário Teste',
      userEmail: process.env.TEST_EMAIL_TO || 'teste@example.com',
      resetUrl: 'https://chronos.local/auth/reset-password?token=teste',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      reason: 'Teste do script de diagnostico'
    })
    console.log(resetResult ? '   ✅ Email de reset enviado!' : '   ❌ Falha no email de reset')

    console.log('\n3️⃣ Enviando notificação administrativa...')
    const adminResult = await emailService.sendMassPasswordResetNotification(
      process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      3,
      'Teste automatizado'
    )
    console.log(adminResult ? '   ✅ Notificação enviada!' : '   ❌ Falha na notificação')

    console.log('\n🎉 Diagnóstico concluído. Configure SMTP_* no .env para testar com sua caixa real.')
  } catch (error) {
    console.error('❌ Erro durante o teste de email:', error)
    process.exit(1)
  }
}

runEmailDiagnostics()

