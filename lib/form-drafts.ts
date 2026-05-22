/**
 * Biblioteca para gerenciar rascunhos de formulários
 */

export type FormType =
  | 'final-report'
  | 'monthly-report'
  | 'internship-registration'
  | 'internship-registration-request'
  | 'commitment-term'
  | 'additive-term'
  | 'equivalence-request'
  | 'extension-declaration'
  | 'professional-activities'
  | 'professional-declaration'
  | 'semester-report'
  | 'rescission-term'
  | 'realization-term'
  | 'student-evaluation'

export interface FormDraftData {
  formType: FormType
  formData: Record<string, unknown>
}

/**
 * Salva um rascunho de formulário localmente (localStorage)
 */
export function saveDraftLocally(formType: FormType, formData: Record<string, unknown>): void {
  if (typeof window === 'undefined') return // Skip on server

  try {
    const key = `form_draft_${formType}`
    const draft = {
      formType,
      formData,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(draft))
    console.log(`Rascunho salvo localmente: ${formType}`)
  } catch (error) {
    console.error('Erro ao salvar rascunho localmente:', error)
  }
}

/**
 * Recupera um rascunho salvo localmente
 */
export function getDraftLocally(formType: FormType): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null // Skip on server

  try {
    const key = `form_draft_${formType}`
    const draft = localStorage.getItem(key)
    if (draft) {
      const parsed = JSON.parse(draft)
      return parsed.formData
    }
    return null
  } catch (error) {
    console.error('Erro ao recuperar rascunho localmente:', error)
    return null
  }
}

/**
 * Remove um rascunho salvo localmente
 */
export function removeDraftLocally(formType: FormType): void {
  if (typeof window === 'undefined') return // Skip on server

  try {
    const key = `form_draft_${formType}`
    localStorage.removeItem(key)
    console.log(`Rascunho removido: ${formType}`)
  } catch (error) {
    console.error('Erro ao remover rascunho:', error)
  }
}

/**
 * Salva um rascunho no servidor
 */
export async function saveDraftToServer(
  formType: FormType,
  formData: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/forms/drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formType,
        formData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Rascunho salvo no servidor: ${formType}`)
    return { success: true, message: 'Rascunho salvo com sucesso!' }
  } catch (error) {
    console.error('Erro ao salvar rascunho no servidor:', error)
    return { success: false, message: 'Erro ao salvar rascunho' }
  }
}

/**
 * Recupera um rascunho do servidor
 */
export async function getDraftFromServer(formType: FormType): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`/api/forms/drafts?formType=${formType}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.formData
  } catch (error) {
    console.error('Erro ao recuperar rascunho do servidor:', error)
    return null
  }
}

/**
 * Salva rascunho localmente e no servidor
 */
export async function saveDraft(formType: FormType, formData: Record<string, unknown>): Promise<void> {
  // Salva localmente primeiro (mais rápido)
  saveDraftLocally(formType, formData)

  // Tenta salvar no servidor
  try {
    await saveDraftToServer(formType, formData)
  } catch (error) {
    console.warn('Falha ao salvar no servidor, usando apenas localStorage:', error)
  }
}

/**
 * Recupera rascunho do servidor ou localStorage
 */
export async function getDraft(formType: FormType): Promise<Record<string, unknown> | null> {
  // Tenta recuperar do servidor primeiro
  try {
    const serverDraft = await getDraftFromServer(formType)
    if (serverDraft) {
      return serverDraft
    }
  } catch (error) {
    console.warn('Falha ao recuperar do servidor, tentando localStorage:', error)
  }

  // Fallback para localStorage
  return getDraftLocally(formType)
}

/**
 * Limpa todos os rascunhos locais
 */
export function clearAllLocalDrafts(): void {
  if (typeof window === 'undefined') return // Skip on server

  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith('form_draft_')) {
        localStorage.removeItem(key)
      }
    })
    console.log('Todos os rascunhos locais foram removidos')
  } catch (error) {
    console.error('Erro ao limpar rascunhos:', error)
  }
}

/**
 * Extrai dados de um formulário HTML
 */
export function extractFormData(formElement: HTMLFormElement): Record<string, unknown | unknown[]> {
  const formData = new FormData(formElement)
  const data: Record<string, unknown | unknown[]> = {}

  formData.forEach((value, key) => {
    if (data[key]) {
      // Se a chave já existe, converte para array
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]]
      }
      ;(data[key] as unknown[]).push(value)
    } else {
      data[key] = value
    }
  })

  return data
}

/**
 * Popula um formulário com dados salvos
 */
export function populateFormWithData(
  formElement: HTMLFormElement,
  data: Record<string, unknown>
): void {
  Object.entries(data).forEach(([key, value]) => {
    const inputs = formElement.querySelectorAll(`[name="${key}"]`) as NodeListOf<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >

    inputs.forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        const checkbox = input as HTMLInputElement
        checkbox.checked = value === 'on' || value === true || value === checkbox.value
      } else if (input.tagName === 'TEXTAREA') {
        input.value = String(value)
      } else if (input.tagName === 'SELECT') {
        input.value = String(value)
      } else {
        input.value = String(value)
      }
    })
  })
}
