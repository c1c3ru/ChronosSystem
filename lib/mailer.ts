import nodemailer from 'nodemailer'
import { env } from './env'
import { isGmailApiConfigured } from './gmail-api'

/**
 * Timeouts explícitos da conexão SMTP. Os padrões do nodemailer são altos
 * demais para uma função serverless chamada por um cron externo: 2 min para
 * conectar, 30s de saudação e 10 MINUTOS de socket ocioso. Com eles, um único
 * destinatário cuja conexão trava segura o lote inteiro e o endpoint de cron
 * nunca responde — foi assim que o job do GitHub Actions morreu com exit 28
 * (curl --max-time 30) sem receber nada de volta. Aqui uma conexão ruim falha
 * rápido, vira ETIMEDOUT (tratado como transitório em lib/email.ts) e o lote
 * segue para o próximo destinatário.
 */
const SMTP_CONNECTION_TIMEOUT_MS = 5_000
const SMTP_GREETING_TIMEOUT_MS = 5_000
const SMTP_SOCKET_TIMEOUT_MS = 10_000

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
    // Uma única conexão reaproveitada entre os e-mails de um lote: abrir uma
    // conexão SMTP nova por mensagem (DNS + TCP + STARTTLS + AUTH) custava
    // ~2s por e-mail e estourava o orçamento de tempo do cron depois de 4 ou
    // 5 envios. Com o pool, só o primeiro e-mail paga esse custo. Se a conexão
    // tiver morrido enquanto a função estava congelada, o erro de socket é
    // transitório e o retry de EmailService.sendEmail abre outra.
    pool: true,
    maxConnections: 1,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  })
}

export const mailerTransport = createTransport()

/** Endereço remetente exibido nos emails (ex: "Chronos IFCE <cti.maracanau@ifce.edu.br>") */
export const MAIL_FROM = env.MAIL_FROM || env.SMTP_FROM

/**
 * Verifica se o SMTP está configurado corretamente.
 * Usado pelo EmailService para logar aviso antecipado.
 */
export function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM)
}

export type MailProvider = 'gmail-api' | 'smtp'

/**
 * Provedor usado para enviar e-mails. A API do Gmail (HTTPS) tem prioridade:
 * o SMTP com smtp.gmail.com falhava na Vercel com `getaddrinfo EBUSY`. O SMTP
 * fica como alternativa para quem ainda não configurou o refresh token.
 * `null` = nenhum provedor configurado (e-mails não são enviados).
 */
export function getMailProvider(): MailProvider | null {
  if (MAIL_FROM && isGmailApiConfigured()) return 'gmail-api'
  if (isSmtpConfigured()) return 'smtp'
  return null
}
