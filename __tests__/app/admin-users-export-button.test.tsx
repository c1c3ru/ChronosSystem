import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import UsersPage from '@/app/admin/users/page'

jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedUseSession = useSession as jest.Mock
const mockedFetch = global.fetch as jest.Mock

function mockFetchResponses() {
  mockedFetch.mockImplementation((url: string) => {
    if (typeof url === 'string' && url.startsWith('/api/admin/students/export')) {
      return Promise.resolve({
        ok: true,
        blob: () =>
          Promise.resolve(
            new Blob(['\uFEFF"Nome Completo","Matrícula","E-mail","Turno","Status"'], {
              type: 'text/csv',
            })
          ),
      })
    }

    // /api/users?limit=500&page=1 - carregamento inicial da listagem
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    })
  })
}

describe('Página de Usuários - botão Exportar CSV de alunos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSession.mockReturnValue({
      data: {
        user: { id: 'admin-1', name: 'Administrador', email: 'admin@example.com', role: 'ADMIN' },
      },
      status: 'authenticated',
    })
    mockFetchResponses()

    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    window.URL.revokeObjectURL = jest.fn()
  })

  it('exibe o botão "Exportar CSV" na tela de listagem de alunos/usuários', async () => {
    render(<UsersPage />)

    const exportButton = await screen.findByRole('button', { name: /Exportar CSV/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('aciona a busca do CSV e força o download com nome de arquivo dinâmico ao clicar', async () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<UsersPage />)

    const exportButton = await screen.findByRole('button', { name: /Exportar CSV/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith('/api/admin/students/export')
    })

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalledTimes(1)
    })

    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

    const downloadedLink = clickSpy.mock.instances[0] as unknown as HTMLAnchorElement
    expect(downloadedLink.download).toMatch(/^alunos_chronos_\d{4}-\d{2}-\d{2}\.csv$/)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Alunos exportados com sucesso!',
        expect.objectContaining({ id: 'export-students' })
      )
    })

    clickSpy.mockRestore()
  })
})
