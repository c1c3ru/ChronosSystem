import nodemailer from 'nodemailer'
import { env } from './env'

/**
 * Transport SMTP do sistema — configurado via variáveis de ambiente.
 * Para Gmail/Google Workspace: use App Password (não a senha da conta).
 * Gere em: myaccount.google.com → Segurança → Senhas de app
 *
 * As variáveis SMTP são opcionais no schema do Zod para não bloquear o
 * build/CI. A validação real ocorre aqui, em runtime, ao tentar enviar.
 */
function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    // Retorna um transport inativo — falha no momento do sendMail(), não no import
    return nodemailer.createTransport({ jsonTransport: true })
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false, // STARTTLS no port 587 (Gmail padrão)
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  })
}

export const mailerTransport = createTransport()

/** Endereço remetente exibido nos emails (ex: "Chronos IFCE <cti.maracanau@ifce.edu.br>") */
export const MAIL_FROM = env.SMTP_FROM

/**
 * Verifica se o SMTP está configurado corretamente.
 * Usado pelo EmailService para logar aviso antecipado.
 */
export function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM)
}
