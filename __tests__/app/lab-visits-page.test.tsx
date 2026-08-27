import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useSession } from 'next-auth/react'
import LabVisitsPage from '@/app/lab-visits/page'

const mockUseSession = useSession as jest.Mock

const mockLaboratoriesResponse = {
  laboratories: [
    {
      id: 'lab-1',
      sigla: 'LAB-IA',
      nome: 'Laboratório de Inteligência Artificial',
      descricao: 'Laboratório equipado para pesquisas em IA.',
      available: true,
    },
  ],
}

const mockPublicVisitsResponse = {
  visits: [
    {
      responsibleName: 'Maria Silva',
      schoolName: 'Escola Estadual Exemplo',
      studentCount: 25,
      visitDate: '2026-09-10T00:00:00.000Z',
      shift: 'MORNING',
    },
  ],
}

function mockFetchByUrl() {
  return jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.includes('/api/lab-visits/laboratories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLaboratoriesResponse),
      })
    }

    if (url.includes('/api/lab-visits/public')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPublicVisitsResponse),
      })
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  }) as unknown as typeof fetch
}

describe('LabVisitsPage - renderização condicional', () => {
  beforeEach(() => {
    global.fetch = mockFetchByUrl()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Estado autenticado (logado)', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'u1', name: 'Admin', email: 'admin@ifce.edu.br', role: 'ADMIN' } },
        status: 'authenticated',
      })
    })

    it('não renderiza o formulário "Agendar Visita" no DOM', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('LAB-IA')).toBeInTheDocument()
      })

      expect(screen.queryByRole('form', { name: /agendar visita/i })).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/nome do responsável/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/nome da escola/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/telefone para contato/i)).not.toBeInTheDocument()
    })

    it('renderiza os cards de laboratório com sigla, nome e descrição', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('LAB-IA')).toBeInTheDocument()
      })

      expect(screen.getByText('Laboratório de Inteligência Artificial')).toBeInTheDocument()
      expect(screen.getByText('Laboratório equipado para pesquisas em IA.')).toBeInTheDocument()
      expect(screen.getByTestId('lab-status-lab-1')).toHaveTextContent('Disponível')
    })

    it('o botão "Confirmar as visitas" está presente e habilitado', async () => {
      render(<LabVisitsPage />)

      const confirmButton = await screen.findByRole('button', { name: /confirmar as visitas/i })
      expect(confirmButton).toBeEnabled()
    })

    it('a opção de adicionar mais laboratórios existe no DOM', async () => {
      render(<LabVisitsPage />)

      const addLabButton = await screen.findByRole('button', { name: /adicionar laboratório/i })
      expect(addLabButton).toBeInTheDocument()
      expect(addLabButton).toBeEnabled()
    })
  })

  describe('Estado não autenticado (visitante)', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    })

    it('renderiza o formulário completo "Agendar Visita" no DOM', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('LAB-IA')).toBeInTheDocument()
      })

      expect(screen.getByRole('form', { name: /agendar visita/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/nome do responsável/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nome da escola/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantidade de alunos/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email para contato/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/telefone para contato/i)).toBeInTheDocument()
    })

    it('renderiza os cards de laboratório também para o visitante', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('LAB-IA')).toBeInTheDocument()
      })
    })

    it('renderiza a lista de visitas confirmadas sem dados de contato (LGPD)', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('Escola Estadual Exemplo')).toBeInTheDocument()
      })

      expect(screen.getByText(/Maria Silva/)).toBeInTheDocument()
      // Nenhum e-mail ou telefone deve aparecer em lugar nenhum da tela pública
      expect(screen.queryByText(/@/)).not.toBeInTheDocument()
    })

    it('não renderiza o botão "Confirmar as visitas" (ação exclusiva de quem está logado)', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('LAB-IA')).toBeInTheDocument()
      })

      expect(
        screen.queryByRole('button', { name: /confirmar as visitas/i })
      ).not.toBeInTheDocument()
    })

    it('não renderiza a opção de adicionar laboratório (ação exclusiva de quem está logado)', async () => {
      render(<LabVisitsPage />)

      await waitFor(() => {
        expect(screen.getByText('LAB-IA')).toBeInTheDocument()
      })

      expect(
        screen.queryByRole('button', { name: /adicionar laboratório/i })
      ).not.toBeInTheDocument()
    })
  })
})
