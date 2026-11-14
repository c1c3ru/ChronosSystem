const mockGetSession = jest.fn()
jest.mock('next-auth/react', () => ({ getSession: () => mockGetSession() }))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() },
}))

import { saveDraft, getDraft, clearLocalDrafts, notifyDraftSaved } from '@/lib/form-drafts'
import { isFormType } from '@/lib/form-types'
import { toast } from 'sonner'

const mockToast = toast as jest.Mocked<typeof toast>

const asUser = (id: string | null) =>
  mockGetSession.mockResolvedValue(id ? { user: { id, email: `${id}@x.com` } } : null)

const mockFetch = (impl: (url: string, init?: RequestInit) => Partial<Response>) => {
  global.fetch = jest.fn(async (url: string, init?: RequestInit) => impl(url, init)) as never
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

describe('rascunho local por usuário', () => {
  it('outro usuário no mesmo navegador não recebe o rascunho', async () => {
    mockFetch(() => ({ ok: false, status: 503 })) // servidor fora: força uso do local
    asUser('aluno-a')
    await saveDraft('commitment-term', { student_cpf: '529.982.247-25' })

    asUser('aluno-b')
    expect(await getDraft('commitment-term')).toBeNull()

    asUser('aluno-a')
    expect(await getDraft('commitment-term')).toEqual({ student_cpf: '529.982.247-25' })
  })

  it('não grava cópia local sem usuário logado', async () => {
    mockFetch(() => ({ ok: false, status: 401 }))
    asUser(null)
    const result = await saveDraft('monthly-report', { a: 1 })
    expect(result).toEqual({ savedOnServer: false, savedLocally: false })
    expect(localStorage.length).toBe(0)
  })

  it('apaga rascunhos no formato antigo, sem usuário na chave', async () => {
    localStorage.setItem('form_draft_commitment-term', JSON.stringify({ formData: { x: 1 } }))
    mockFetch(() => ({ ok: false, status: 404 }))
    asUser('aluno-a')
    expect(await getDraft('commitment-term')).toBeNull()
    expect(localStorage.getItem('form_draft_commitment-term')).toBeNull()
  })

  it('clearLocalDrafts remove todos os rascunhos e preserva outras chaves', async () => {
    mockFetch(() => ({ ok: true, status: 200 }))
    asUser('aluno-a')
    await saveDraft('final-report', { a: 1 })
    localStorage.setItem('theme', 'dark')
    clearLocalDrafts()
    expect(localStorage.length).toBe(1)
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})

describe('resultado do salvamento', () => {
  it('informa falha do servidor em vez de dizer que salvou', async () => {
    mockFetch(() => ({ ok: false, status: 500 }))
    asUser('aluno-a')
    const result = await saveDraft('additive-term', { a: 1 })
    expect(result).toEqual({ savedOnServer: false, savedLocally: true })

    notifyDraftSaved(result)
    expect(mockToast.success).not.toHaveBeenCalled()
    expect(mockToast.warning).toHaveBeenCalledWith(expect.stringMatching(/só neste navegador/))
  })

  it('confirma quando o servidor salvou', () => {
    notifyDraftSaved({ savedOnServer: true, savedLocally: true })
    expect(mockToast.success).toHaveBeenCalled()
  })

  it('prefere o rascunho do servidor quando ele responde', async () => {
    mockFetch((url, init) =>
      init?.method === 'POST'
        ? { ok: true, status: 200 }
        : { ok: true, status: 200, json: async () => ({ formData: { origem: 'servidor' } }) }
    )
    asUser('aluno-a')
    await saveDraft('semester-report', { origem: 'local' })
    expect(await getDraft('semester-report')).toEqual({ origem: 'servidor' })
  })
})

describe('isFormType', () => {
  it('aceita só os tipos conhecidos', () => {
    expect(isFormType('commitment-term')).toBe(true)
    expect(isFormType('qualquer-coisa')).toBe(false)
    expect(isFormType(undefined)).toBe(false)
  })
})

describe('salvamento que não chegou ao servidor', () => {
  it('recarrega a cópia local quando o servidor não tem o rascunho', async () => {
    mockFetch((url, init) =>
      init?.method === 'POST' ? { ok: false, status: 500 } : { ok: false, status: 404 }
    )
    asUser('aluno-a')
    await saveDraft('rescission-term', { motivo: 'teste' })
    expect(await getDraft('rescission-term')).toEqual({ motivo: 'teste' })
  })
})
