// Utilitário para envio de emails usando Nodemailer
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface PasswordResetEmailData {
  userName: string
  userEmail: string
  resetUrl: string
  expiresAt: Date
  reason?: string
}

export class EmailService {
  private static instance: EmailService
  private transporter: Transporter | null = null
  
  private constructor() {
    this.initializeTransporter()
  }
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private initializeTransporter() {
    try {
      // Configuração do transporter
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Para desenvolvimento
        }
      }

      // Verificar se as credenciais estão configuradas
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ [EMAIL] Credenciais SMTP não configuradas. Usando modo de desenvolvimento.')
        
        // Usar Ethereal Email para desenvolvimento/teste
        this.createTestAccount()
        return
      }

      this.transporter = nodemailer.createTransport(emailConfig)
      
      // Verificar conexão
      this.transporter?.verify((error, success) => {
        if (error) {
          console.error('❌ [EMAIL] Erro na configuração SMTP:', error)
        } else {
          console.log('✅ [EMAIL] Servidor SMTP configurado com sucesso')
        }
      })

    } catch (error) {
      console.error('❌ [EMAIL] Erro ao inicializar transporter:', error)
    }
  }

  private async createTestAccount() {
    try {
      // Criar conta de teste com Ethereal Email
      const testAccount = await nodemailer.createTestAccount()
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })

      console.log('🧪 [EMAIL] Usando conta de teste Ethereal:')
      console.log(`   User: ${testAccount.user}`)
      console.log(`   Pass: ${testAccount.pass}`)
      console.log('   📧 Emails serão visíveis em: https://ethereal.email')

    } catch (error) {
      console.error('❌ [EMAIL] Erro ao criar conta de teste:', error)
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.error('❌ [EMAIL] Transporter não inicializado')
        return false
      }

      const mailOptions = {
        from: `"Chronos System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      }

      console.log('📧 [EMAIL] Enviando email:', {
        to: options.to,
        subject: options.subject,
        from: mailOptions.from
      })

      const info = await this.transporter.sendMail(mailOptions)
      
      console.log('✅ [EMAIL] Email enviado com sucesso!')
      console.log(`   Message ID: ${info.messageId}`)
      
      // Se usando Ethereal, mostrar URL de preview
      if (info.previewURL) {
        console.log(`   📧 Preview: ${info.previewURL}`)
      }
      
      return true
    } catch (error) {
      console.error('❌ [EMAIL] Erro ao enviar email:', error)
      return false
    }
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const subject = 'Reset de Senha - Chronos System'
    
    const html = this.generatePasswordResetHTML(data)
    const text = this.generatePasswordResetText(data)

    return await this.sendEmail({
      to: data.userEmail,
      subject,
      html,
      text
    })
  }

  async sendMassPasswordResetNotification(
    adminEmail: string, 
    resetCount: number, 
    reason: string
  ): Promise<boolean> {
    const subject = `Reset de Senha em Massa - ${resetCount} usuários`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Reset de Senha em Massa</h2>
        <p>Um reset de senha em massa foi executado no sistema Chronos.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Usuários afetados:</strong> ${resetCount}</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <p>Todos os usuários afetados devem receber instruções para redefinir suas senhas.</p>
        
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Este é um email automático do sistema Chronos. Não responda a este email.
        </p>
      </div>
    `

    const text = `
      Reset de Senha em Massa - Chronos System
      
      Um reset de senha em massa foi executado no sistema.
      
      Usuários afetados: ${resetCount}
      Motivo: ${reason}
      Data/Hora: ${new Date().toLocaleString('pt-BR')}
      
      Todos os usuários afetados devem receber instruções para redefinir suas senhas.
    `

    return await this.sendEmail({
      to: adminEmail,
      subject,
      html,
      text
    })
  }

  private generatePasswordResetHTML(data: PasswordResetEmailData): string {
    const expiresIn = Math.ceil((data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <h1 style="color: #1f2937; margin: 0;">🕐 Chronos System</h1>
        </div>
        
        <div style="padding: 32px 20px;">
          <h2 style="color: #1f2937;">Reset de Senha Solicitado</h2>
          
          <p>Olá <strong>${data.userName}</strong>,</p>
          
          <p>Foi solicitado um reset de senha para sua conta no sistema Chronos.</p>
          
          ${data.reason ? `
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>Motivo:</strong> ${data.reason}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>⏰ Este link expira em ${expiresIn} hora(s).</strong>
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Se você não conseguir clicar no botão, copie e cole o link abaixo no seu navegador:
          </p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 8px; border-radius: 4px; font-size: 12px;">
            ${data.resetUrl}
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
    `
  }

  private generatePasswordResetText(data: PasswordResetEmailData): string {
    const expiresIn = Math.ceil((data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
    
    return `
      Chronos System - Reset de Senha
      
      Olá ${data.userName},
      
      Foi solicitado um reset de senha para sua conta no sistema Chronos.
      
      ${data.reason ? `Motivo: ${data.reason}\n` : ''}
      
      Para redefinir sua senha, acesse o link abaixo:
      ${data.resetUrl}
      
      ⏰ Este link expira em ${expiresIn} hora(s).
      
      ⚠️ Importante: Se você não solicitou este reset, ignore este email. 
      Sua senha atual permanecerá inalterada.
      
      ---
      Este é um email automático do sistema Chronos. Não responda a este email.
    `
  }
}

// Instância singleton
export const emailService = EmailService.getInstance()

// Tipos para exportação
export type { EmailOptions, PasswordResetEmailData }
