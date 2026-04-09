/**
 * Utilitários para máscaras de input
 */

export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

/**
 * Máscara para RG
 * Formato: XX.XXX.XXX-X
 */
export const maskRG = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})/, '$1-$2')
    .replace(/(-\d{1})\d+?$/, '$1')
}

/**
 * Máscara para CTPS (Carteira de Trabalho)
 * Formato: XXXXXXX/XXXX-X
 */
export const maskCTPS = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{7})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{1})\d+?$/, '$1')
}

export const maskCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

export const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Máscara para valores monetários (R$)
 * Exemplos: R$ 1.234,56 | R$ 10,00 | R$ 1.000.000,00
 */
export const maskCurrency = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')

  // Se vazio, retorna vazio
  if (!numbers) return ''

  // Converte para número e divide por 100 para ter os centavos
  const amount = parseInt(numbers) / 100

  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Remove a máscara de moeda e retorna apenas o número
 * Útil para enviar ao backend
 */
export const unmaskCurrency = (value: string): string => {
  return value.replace(/\D/g, '')
}
