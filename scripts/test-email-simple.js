// Script simples para testar o sistema de email
// Execute com: node scripts/test-email-simple.js

const nodemailer = require('nodemailer')

async function testEmailSystem() {
  console.log('📧 Testando Sistema de Email com Nodemailer\n')

  try {
    // 1. Criar conta de teste Ethereal
    console.log('1. Criando conta de teste Ethereal...')
    const testAccount = await nodemailer.createTestAccount()

    console.log(`   ✅ Conta criada:`)
    console.log(`   📧 User: ${testAccount.user}`)
    console.log(`   🔑 Pass: ${testAccount.pass}`)

    // 2. Configurar transporter
    console.log('\n2. Configurando transporter...')
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })

    console.log('   ✅ Transporter configurado')

    // 3. Testar email simples
    console.log('\n3. Enviando email de teste...')

    const mailOptions = {
      from: '"Chronos System" <noreply@chronos.com>',
      to: 'teste@example.com',
      subject: '🧪 Teste do Sistema de Email - Chronos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="color: #1f2937; margin: 0;">🕐 Chronos System</h1>
          </div>
          
          <div style="padding: 32px 20px;">
            <h2 style="color: #1f2937;">🧪 Teste do Sistema de Email</h2>
            
            <p>Olá!</p>
            
            <p>Este é um email de teste do sistema Chronos com <strong>Nodemailer</strong>.</p>
            
            <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #0ea5e9;">
              <p style="margin: 0; color: #0c4a6e;">
                ✅ Se você está vendo isso, o sistema de email está funcionando perfeitamente!
              </p>
            </div>
            
            <p><strong>Recursos testados:</strong></p>
            <ul>
              <li>✅ Configuração do Nodemailer</li>
              <li>✅ Conta de teste Ethereal</li>
              <li>✅ Template HTML responsivo</li>
              <li>✅ Envio via SMTP</li>
            </ul>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>⏰ Enviado em:</strong> ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Este é um email automático do sistema Chronos. Não responda a este email.
            </p>
          </div>
        </div>
      `,
      text: `
        Chronos System - Teste de Email
        
        Olá!
        
        Este é um email de teste do sistema Chronos com Nodemailer.
        
        ✅ Se você está vendo isso, o sistema de email está funcionando perfeitamente!
        
        Recursos testados:
        - Configuração do Nodemailer
        - Conta de teste Ethereal
        - Template HTML responsivo
        - Envio via SMTP
        
        Enviado em: ${new Date().toLocaleString('pt-BR')}
        
        ---
        Este é um email automático do sistema Chronos. Não responda a este email.
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('   ✅ Email enviado com sucesso!')
    console.log(`   📨 Message ID: ${info.messageId}`)
    console.log(`   🔗 Preview URL: ${info.previewURL}`)

    // 4. Testar email de reset de senha
    console.log('\n4. Enviando email de reset de senha...')

    const resetToken = 'abc123def456ghi789'
    const resetUrl = `http://localhost:5000/auth/reset-password?token=${resetToken}`

    const resetMailOptions = {
      from: '"Chronos System" <noreply@chronos.com>',
      to: 'usuario@example.com',
      subject: '🔐 Reset de Senha - Chronos System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
            <h1 style="color: #1f2937; margin: 0;">🕐 Chronos System</h1>
          </div>
          
          <div style="padding: 32px 20px;">
            <h2 style="color: #1f2937;">🔐 Reset de Senha Solicitado</h2>
            
            <p>Olá <strong>Usuário Teste</strong>,</p>
            
            <p>Foi solicitado um reset de senha para sua conta no sistema Chronos.</p>
            
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>Motivo:</strong> Teste do sistema de email</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                🔑 Redefinir Senha
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>⏰ Este link expira em 24 hora(s).</strong>
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
            </p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 8px; border-radius: 4px; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>⚠️ Importante:</strong> Se você não solicitou este reset, ignore este email. 
                Sua senha atual permanecerá inalterada.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Este é um email automático do sistema Chronos. Não responda a este email.
            </p>
          </div>
        </div>
      `,
      text: `
        Chronos System - Reset de Senha
        
        Olá Usuário Teste,
        
        Foi solicitado um reset de senha para sua conta no sistema Chronos.
        
        Motivo: Teste do sistema de email
        
        Para redefinir sua senha, acesse o link abaixo:
        ${resetUrl}
        
        ⏰ Este link expira em 24 hora(s).
        
        ⚠️ Importante: Se você não solicitou este reset, ignore este email. 
        Sua senha atual permanecerá inalterada.
        
        ---
        Este é um email automático do sistema Chronos. Não responda a este email.
      `,
    }

    const resetInfo = await transporter.sendMail(resetMailOptions)

    console.log('   ✅ Email de reset enviado com sucesso!')
    console.log(`   📨 Message ID: ${resetInfo.messageId}`)
    console.log(`   🔗 Preview URL: ${resetInfo.previewURL}`)

    // 5. Resumo
    console.log('\n🎉 Teste de email concluído com sucesso!')
    console.log('\n📋 Resumo:')
    console.log('   ✅ Nodemailer instalado e funcionando')
    console.log('   ✅ Conta de teste Ethereal criada')
    console.log('   ✅ Email simples enviado')
    console.log('   ✅ Email de reset de senha enviado')
    console.log('   ✅ Templates HTML funcionando')

    console.log('\n🔗 Links para visualizar os emails:')
    console.log(`   📧 Email simples: ${info.previewURL}`)
    console.log(`   🔐 Email de reset: ${resetInfo.previewURL}`)

    console.log('\n💡 Para usar em produção:')
    console.log('   1. Configure as variáveis SMTP no .env')
    console.log('   2. Para Gmail, use uma senha de app')
    console.log('   3. Teste sempre em desenvolvimento primeiro')
  } catch (error) {
    console.error('❌ Erro durante o teste de email:', error)
  }
}

// Executar teste
testEmailSystem().catch(console.error)
