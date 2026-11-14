/**
 * Rascunhos dos formulários de estágio.
 *
 * O rascunho vai para o servidor (tabela FormDraft, por usuário) e, como cópia de segurança,
 * para o localStorage. A cópia local leva o id do usuário na chave: em computador
 * compartilhado, um aluno não abre o rascunho (com CPF e endereço) de outro.
 */

import { toast } from 'sonner'
import type { FormType } from '@/lib/form-types'

export type { FormType } from '@/lib/form-types'

export interface DraftSaveResult {
  savedOnServer: boolean
  savedLocally: boolean
}

const LOCAL_PREFIX = 'form_draft:'
/** Formato antigo, sem usuário na chave. Apagado ao carregar qualquer rascunho. */
const LEGACY_PREFIX = 'form_draft_'

async function currentUserKey(): Promise<string | null> {
  try {
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    return session?.user?.id || session?.user?.email || null
  } catch {
    return null
  }
}

const localKey = (userKey: string, formType: FormType) => `${LOCAL_PREFIX}${userKey}:${formType}`

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function removeKeys(predicate: (key: string) => boolean): void {
  const ls = storage()
  if (!ls) return
  const keys: string[] = []
  for (let i = 0; i < ls.length; i++) {
    const key = ls.key(i)
    if (key && predicate(key)) keys.push(key)
  }
  keys.forEach((key) => ls.removeItem(key))
}

/** Apaga rascunhos gravados no formato antigo (sem usuário na chave). */
export function purgeLegacyDrafts(): void {
  removeKeys((key) => key.startsWith(LEGACY_PREFIX))
}

/** Apaga todos os rascunhos locais deste navegador. Chamado no logout. */
export function clearLocalDrafts(): void {
  removeKeys((key) => key.startsWith(LOCAL_PREFIX) || key.startsWith(LEGACY_PREFIX))
}

function saveDraftLocally(
  userKey: string | null,
  formType: FormType,
  formData: Record<string, unknown>
): boolean {
  const ls = storage()
  if (!ls || !userKey) return false
  try {
    ls.setItem(
      localKey(userKey, formType),
      JSON.stringify({ formType, formData, savedAt: new Date().toISOString() })
    )
    return true
  } catch {
    return false
  }
}

function getDraftLocally(
  userKey: string | null,
  formType: FormType
): Record<string, unknown> | null {
  const ls = storage()
  if (!ls || !userKey) return null
  try {
    const raw = ls.getItem(localKey(userKey, formType))
    return raw ? (JSON.parse(raw).formData ?? null) : null
  } catch {
    return null
  }
}

async function saveDraftToServer(
  formType: FormType,
  formData: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch('/api/forms/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, formData }),
    })
    return response.ok
  } catch {
    return false
  }
}

async function getDraftFromServer(formType: FormType): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`/api/forms/drafts?formType=${formType}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.formData ?? null
  } catch {
    return null
  }
}

/** Salva no servidor e numa cópia local do usuário logado. */
export async function saveDraft(
  formType: FormType,
  formData: Record<string, unknown>
): Promise<DraftSaveResult> {
  const userKey = await currentUserKey()
  const savedLocally = saveDraftLocally(userKey, formType, formData)
  const savedOnServer = await saveDraftToServer(formType, formData)
  return { savedOnServer, savedLocally }
}

/** Busca o rascunho no servidor; sem ele, usa a cópia local do mesmo usuário. */
export async function getDraft(formType: FormType): Promise<Record<string, unknown> | null> {
  purgeLegacyDrafts()
  const serverDraft = await getDraftFromServer(formType)
  if (serverDraft) return serverDraft
  // Sem rascunho no servidor (ou servidor fora): vale a cópia local do mesmo usuário,
  // que existe quando o último salvamento não chegou ao servidor.
  return getDraftLocally(await currentUserKey(), formType)
}

/** Mensagem para o aluno conforme onde o rascunho ficou salvo. */
export function notifyDraftSaved({ savedOnServer, savedLocally }: DraftSaveResult): void {
  if (savedOnServer) {
    toast.success('Rascunho salvo com sucesso!')
  } else if (savedLocally) {
    toast.warning(
      'Não foi possível salvar no servidor. O rascunho ficou só neste navegador; tente salvar de novo antes de trocar de computador.'
    )
  } else {
    toast.error('Não foi possível salvar o rascunho. Verifique a conexão e tente de novo.')
  }
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
      } else {
        input.value = String(value)
      }
    })
  })
}
