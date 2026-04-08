/**
 * Calculadora de Estágio
 * 
 * Calcula datas de término, progresso e linha do tempo para estágios
 * baseado na carga horária obrigatória de 200 horas
 */

export interface InternshipCalculation {
  startDate: Date
  estimatedEndDate: Date
  totalRequiredHours: number
  weeklyHours: number
  estimatedWeeks: number
  workingDaysRequired: number
}

export interface InternshipProgress {
  totalRequiredHours: number
  completedHours: number
  remainingHours: number
  progressPercentage: number
  estimatedEndDate: Date
  actualEndDate?: Date
  daysWorked: number
  daysRemaining: number
  isOnTrack: boolean
  delayDays?: number
}

/**
 * Calcula a data estimada de término do estágio
 */
export function calculateInternshipEnd(
  startDate: Date, 
  weeklyHours: number, 
  totalHours: number = 200
): InternshipCalculation {
  const weeksNeeded = Math.ceil(totalHours / weeklyHours)
  const workingDaysRequired = Math.ceil(totalHours / (weeklyHours / 5)) // Assumindo 5 dias úteis por semana
  
  // Calcular data final considerando apenas dias úteis (segunda a sexta)
  const endDate = new Date(startDate)
  let daysAdded = 0
  let workingDaysAdded = 0
  
  while (workingDaysAdded < workingDaysRequired) {
    endDate.setDate(endDate.getDate() + 1)
    daysAdded++
    
    // Verificar se é dia útil (segunda=1 a sexta=5)
    const dayOfWeek = endDate.getDay()
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDaysAdded++
    }
  }
  
  return {
    startDate,
    estimatedEndDate: endDate,
    totalRequiredHours: totalHours,
    weeklyHours,
    estimatedWeeks: weeksNeeded,
    workingDaysRequired
  }
}

/**
 * Calcula o progresso atual do estágio
 */
export function calculateInternshipProgress(
  startDate: Date,
  weeklyHours: number,
  completedHours: number,
  totalHours: number = 200
): InternshipProgress {
  const calculation = calculateInternshipEnd(startDate, weeklyHours, totalHours)
  const today = new Date()
  
  // Calcular dias trabalhados (apenas dias úteis)
  let daysWorked = 0
  const currentDate = new Date(startDate)
  
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Segunda a sexta
      daysWorked++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  const expectedHours = Math.min((daysWorked * (weeklyHours / 5)), totalHours)
  const progressPercentage = Math.min((completedHours / totalHours) * 100, 100)
  const remainingHours = Math.max(totalHours - completedHours, 0)
  
  // Verificar se está no cronograma
  const isOnTrack = completedHours >= (expectedHours * 0.95) // 5% de tolerância
  
  // Calcular atraso em dias se houver
  let delayDays = 0
  if (!isOnTrack && completedHours < expectedHours) {
    const hoursDelay = expectedHours - completedHours
    delayDays = Math.ceil(hoursDelay / (weeklyHours / 5))
  }
  
  // Recalcular data final baseada no progresso atual
  let actualEndDate = calculation.estimatedEndDate
  if (delayDays > 0) {
    actualEndDate = new Date(calculation.estimatedEndDate)
    // Adicionar dias de atraso considerando fins de semana
    let daysToAdd = delayDays
    while (daysToAdd > 0) {
      actualEndDate.setDate(actualEndDate.getDate() + 1)
      const dayOfWeek = actualEndDate.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        daysToAdd--
      }
    }
  }
  
  // Calcular dias restantes
  const daysRemaining = Math.max(
    Math.ceil(remainingHours / (weeklyHours / 5)), 
    0
  )
  
  return {
    totalRequiredHours: totalHours,
    completedHours,
    remainingHours,
    progressPercentage,
    estimatedEndDate: calculation.estimatedEndDate,
    actualEndDate,
    daysWorked,
    daysRemaining,
    isOnTrack,
    delayDays: delayDays > 0 ? delayDays : undefined
  }
}

/**
 * Formata duração em texto amigável
 */
export function formatDuration(days: number): string {
  if (days === 0) return 'Hoje'
  if (days === 1) return '1 dia'
  if (days < 7) return `${days} dias`
  
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  
  if (weeks === 1 && remainingDays === 0) return '1 semana'
  if (weeks === 1) return `1 semana e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}`
  if (remainingDays === 0) return `${weeks} semanas`
  
  return `${weeks} semanas e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}`
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Calcula marcos do estágio (25%, 50%, 75%, 100%)
 */
export function getInternshipMilestones(
  startDate: Date,
  endDate: Date,
  totalHours: number = 200
): Array<{
  percentage: number
  hours: number
  estimatedDate: Date
  label: string
}> {
  const milestones = [25, 50, 75, 100]
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return milestones.map(percentage => {
    const hours = (totalHours * percentage) / 100
    const daysOffset = Math.floor((totalDays * percentage) / 100)
    const estimatedDate = new Date(startDate)
    estimatedDate.setDate(estimatedDate.getDate() + daysOffset)
    
    return {
      percentage,
      hours,
      estimatedDate,
      label: percentage === 100 ? 'Conclusão' : `${percentage}% Concluído`
    }
  })
}
