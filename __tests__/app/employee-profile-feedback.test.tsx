import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import EmployeeProfilePage from '@/app/employee/profile/page'

jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(() => 'toast-1'),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  },
}))

const mockedUseSession = useSession as jest.Mock
const mockedFetch = global.fetch as jest.Mock

const PROFILE = {
  name: 'Aluno Teste',
  email: 'aluno@example.com',
  phone: '(85) 98888-7777',
  address: 'Rua Nova, 45, Centro, Maracanaú',
  emergencyContact: 'Mãe',
  emergencyPhone: '(85) 97777-6666',
  shift: 'AFTERNOON',
  shiftStartTime: '13:00',
  shiftEndTime: '17:00',
  workingDaysPerWeek: 5,
  contractType: 'ESTAGIO_20H',
}

function mockApi(putResponse: { ok: boolean; body: Record<string, unknown> }) {
  mockedFetch.mockImplementation((_url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      return Promise.resolve({ ok: putResponse.ok, json: () => Promise.resolve(putResponse.body) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(PROFILE) })
  })
}

describe('Meu perfil - feedback ao salvar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Element.prototype.scrollIntoView = jest.fn()
    mockedUseSession.mockReturnValue({
      data: { user: { id: 'aluno-1', role: 'EMPLOYEE' } },
      status: 'authenticated',
    })
  })

  it('começa sem alterações e com o botão desabilitado', async () => {
    mockApi({ ok: true, body: {} })
    render(<EmployeeProfilePage />)
    expect(await screen.findByText('Nenhuma alteração')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar alterações/ })).toBeDisabled()
  })

  it('mostra "não salvo", depois "Salvo!" com toast de sucesso', async () => {
    mockApi({ ok: true, body: {} })
    render(<EmployeeProfilePage />)
    const start = await screen.findByLabelText('Horário de Início')
    fireEvent.change(start, { target: { value: '14:00' } })
    fireEvent.change(screen.getByLabelText('Horário de Fim'), { target: { value: '18:00' } })
    expect(screen.getByText('Alterações não salvas')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/ }))

    expect(await screen.findByRole('button', { name: /Salvo!/ })).toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledWith(
      'Perfil salvo!',
      expect.objectContaining({ description: expect.stringContaining('14:00 às 18:00') })
    )
  })

  it('erro de validação: toast, aviso na barra e rola até o campo', async () => {
    mockApi({ ok: true, body: {} })
    render(<EmployeeProfilePage />)
    const end = await screen.findByLabelText('Horário de Fim')
    fireEvent.change(end, { target: { value: '12:00' } })
    fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/ }))

    expect(await screen.findByText('Corrija os campos em vermelho')).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalled()
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled())
    expect(mockedFetch).toHaveBeenCalledTimes(1) // só o carregamento, nenhum PUT
  })

  it('erro do servidor aparece no toast e no topo do formulário', async () => {
    mockApi({ ok: false, body: { error: 'Falha no servidor' } })
    render(<EmployeeProfilePage />)
    fireEvent.change(await screen.findByLabelText(/Telefone/, { selector: '#profile-phone' }), {
      target: { value: '85911112222' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar alterações/ }))
    expect(await screen.findByText('Falha no servidor')).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalledWith(
      'Não foi possível salvar',
      expect.objectContaining({ description: 'Falha no servidor' })
    )
  })
})
