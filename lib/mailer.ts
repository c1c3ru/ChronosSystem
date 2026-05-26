import nodemailer from 'nodemailer'
import { env } from './env'

/**
 * Transport SMTP do sistema — configurado via variáveis de ambiente.
 * Para Gmail/Google Workspace: use App Password (não a senha da conta).
 * Gere em: myaccount.google.com → Segurança → Senhas de app
 */
export const mailerTransport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false, // STARTTLS no port 587 (Gmail padrão)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
})

/** Endereço remetente exibido nos emails (ex: "Chronos IFCE <cti.maracanau@ifce.edu.br>") */
export const MAIL_FROM = env.SMTP_FROM
