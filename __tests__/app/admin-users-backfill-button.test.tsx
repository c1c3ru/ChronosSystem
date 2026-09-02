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
    dismiss: jest.fn(),
  },
}))

const mockedUseSession = useSession as jest.Mock
const mockedFetch = global.fetch as jest.Mock

function mockUsersListFetch() {
  mockedFetch.mockImplementation((url: string) => {
    if (typeof url === 'string' && url.startsWith('/api/admin/students/backfill-registration-number')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ dryRun: true, updated: 3, skippedAlreadySet: 1 }),
      })
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ users: [] }),
    })
  })
}

describe('Página de Usuários - botão Migrar Matrículas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsersListFetch()
  })

  it('exibe o botão "Migrar Matrículas" apenas para ADMIN', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' } },
      status: 'authenticated',
    })

    render(<UsersPage />)

    expect(await screen.findByRole('button', { name: /Migrar Matrículas/i })).toBeInTheDocument()
  })

  it('não exibe o botão "Migrar Matrículas" para SUPERVISOR', async () => {
    mockedUseSession.mockReturnValue({
      data: {
        user: { id: 'sup-1', name: 'Supervisor', email: 'sup@example.com', role: 'SUPERVISOR' },
      },
      status: 'authenticated',
    })

    render(<UsersPage />)

    // Espera a tela carregar (usa outro botão sempre visível como âncora) antes de
    // afirmar a ausência, evitando falso-negativo por checar cedo demais.
    await screen.findByRole('button', { name: /Exportar CSV/i })
    expect(screen.queryByRole('button', { name: /Migrar Matrículas/i })).not.toBeInTheDocument()
  })

  it('roda dry-run, pede confirmação e só aplica de fato se confirmado', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' } },
      status: 'authenticated',
    })
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(<UsersPage />)

    const button = await screen.findByRole('button', { name: /Migrar Matrículas/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith(
        '/api/admin/students/backfill-registration-number?dryRun=true',
        { method: 'POST' }
      )
    })

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith('/api/admin/students/backfill-registration-number', {
        method: 'POST',
      })
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('preenchida'),
        expect.objectContaining({ id: 'backfill-registration' })
      )
    })

    confirmSpy.mockRestore()
  })

  it('não aplica a migração se o usuário cancelar a confirmação', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' } },
      status: 'authenticated',
    })
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)

    render(<UsersPage />)

    const button = await screen.findByRole('button', { name: /Migrar Matrículas/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1)
    })

    expect(mockedFetch).not.toHaveBeenCalledWith(
      '/api/admin/students/backfill-registration-number',
      { method: 'POST' }
    )

    confirmSpy.mockRestore()
  })
})
