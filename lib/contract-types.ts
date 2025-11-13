/**
 * Configurações de tipos de contrato e carga horária
 * 
 * Define os tipos de contrato disponíveis e suas respectivas cargas horárias
 * conforme legislação trabalhista brasileira
 */

export interface ContractTypeConfig {
  id: string
  name: string
  category: 'ESTAGIO' | 'EMPREGO'
  weeklyHours: number
  dailyHours: number
  description: string
  isDefault?: boolean
}

export const CONTRACT_TYPES: ContractTypeConfig[] = [
  // ESTÁGIOS (12h a 36h semanais)
  {
    id: 'ESTAGIO_12H',
    name: 'Estágio 12h/semana',
    category: 'ESTAGIO',
    weeklyHours: 12,
    dailyHours: 2.4, // 12h ÷ 5 dias
    description: 'Estágio de 12 horas semanais (2h24min por dia)'
  },
  {
    id: 'ESTAGIO_16H',
    name: 'Estágio 16h/semana',
    category: 'ESTAGIO',
    weeklyHours: 16,
    dailyHours: 3.2, // 16h ÷ 5 dias
    description: 'Estágio de 16 horas semanais (3h12min por dia)'
  },
  {
    id: 'ESTAGIO_20H',
    name: 'Estágio 20h/semana',
    category: 'ESTAGIO',
    weeklyHours: 20,
    dailyHours: 4, // 20h ÷ 5 dias
    description: 'Estágio de 20 horas semanais (4h por dia)',
    isDefault: true
  },
  {
    id: 'ESTAGIO_24H',
    name: 'Estágio 24h/semana',
    category: 'ESTAGIO',
    weeklyHours: 24,
    dailyHours: 4.8, // 24h ÷ 5 dias
    description: 'Estágio de 24 horas semanais (4h48min por dia)'
  },
  {
    id: 'ESTAGIO_30H',
    name: 'Estágio 30h/semana',
    category: 'ESTAGIO',
    weeklyHours: 30,
    dailyHours: 6, // 30h ÷ 5 dias
    description: 'Estágio de 30 horas semanais (6h por dia)'
  },
  {
    id: 'ESTAGIO_36H',
    name: 'Estágio 36h/semana',
    category: 'ESTAGIO',
    weeklyHours: 36,
    dailyHours: 7.2, // 36h ÷ 5 dias
    description: 'Estágio de 36 horas semanais (7h12min por dia)'
  },
  
  // EMPREGOS FORMAIS (40h ou 44h semanais)
  {
    id: 'EMPREGO_40H',
    name: 'Emprego 40h/semana',
    category: 'EMPREGO',
    weeklyHours: 40,
    dailyHours: 8, // 40h ÷ 5 dias
    description: 'Emprego formal de 40 horas semanais (8h por dia)'
  },
  {
    id: 'EMPREGO_44H',
    name: 'Emprego 44h/semana',
    category: 'EMPREGO',
    weeklyHours: 44,
    dailyHours: 8.8, // 44h ÷ 5 dias
    description: 'Emprego formal de 44 horas semanais (8h48min por dia)'
  },
  
  // PERSONALIZADO
  {
    id: 'CUSTOM',
    name: 'Personalizado',
    category: 'ESTAGIO',
    weeklyHours: 20,
    dailyHours: 4,
    description: 'Carga horária personalizada (definida manualmente)'
  }
]

/**
 * Obtém configuração de um tipo de contrato
 */
export function getContractTypeConfig(contractTypeId: string): ContractTypeConfig | undefined {
  return CONTRACT_TYPES.find(type => type.id === contractTypeId)
}

/**
 * Obtém o tipo de contrato padrão
 */
export function getDefaultContractType(): ContractTypeConfig {
  return CONTRACT_TYPES.find(type => type.isDefault) || CONTRACT_TYPES[2] // ESTAGIO_20H
}

/**
 * Valida se a carga horária está dentro dos limites legais
 */
export function validateWorkingHours(weeklyHours: number, category: 'ESTAGIO' | 'EMPREGO'): {
  isValid: boolean
  error?: string
} {
  if (category === 'ESTAGIO') {
    if (weeklyHours < 12) {
      return {
        isValid: false,
        error: 'Estágios devem ter no mínimo 12 horas semanais'
      }
    }
    if (weeklyHours > 36) {
      return {
        isValid: false,
        error: 'Estágios devem ter no máximo 36 horas semanais'
      }
    }
  } else if (category === 'EMPREGO') {
    if (weeklyHours !== 40 && weeklyHours !== 44) {
      return {
        isValid: false,
        error: 'Empregos formais devem ter 40h ou 44h semanais'
      }
    }
  }
  
  return { isValid: true }
}

/**
 * Formata horas decimais para exibição (ex: 4.8 -> "4h48min")
 */
export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  
  if (minutes === 0) {
    return `${wholeHours}h`
  }
  
  return `${wholeHours}h${minutes.toString().padStart(2, '0')}min`
}

/**
 * Calcula horas diárias baseado nas horas semanais (assumindo 5 dias úteis)
 */
export function calculateDailyHours(weeklyHours: number): number {
  return weeklyHours / 5
}
