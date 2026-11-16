import { fireEvent, render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import SchedulePage from '@/app/admin/schedule/page'

jest.mock('@/lib/logout', () => ({ handleCompleteLogout: jest.fn() }))

const mockedSession = useSession as jest.Mock
const mockedFetch = global.fetch as jest.Mock

const base = {
  email: 'student@example.com',
  department: 'TI',
  shiftStartTime: '08:00',
  shiftEndTime: '12:00',
  workingDaysPerWeek: 5,
  weeklyHours: 20,
  allowFlexibleHours: false,
  isPresent: false,
  lastRecord: null,
  todayRecords: [],
  contractType: 'ESTAGIO_20H',
  contractStartDate: '2026-03-01T00:00:00.000Z',
  contractEndDate: '2026-11-25T00:00:00.000Z',
}

describe('Quadro de horários - vigência e filtros', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedSession.mockReturnValue({
      data: { user: { id: 'admin-1', role: 'ADMIN' } },
      status: 'authenticated',
    })
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        employees: [
          { ...base, id: 'morning', name: 'Aluno da Manhã', shift: 'MORNING' },
          { ...base, id: 'night', name: 'Aluno da Noite', shift: 'NIGHT' },
        ],
      }),
    })
  })

  it('exibe datas e filtra turnos nas visões diária e semanal', async () => {
    render(<SchedulePage />)
    expect(await screen.findByText('Aluno da Manhã')).toBeInTheDocument()
    expect(screen.getByText('Vigência do contrato')).toBeInTheDocument()
    expect(screen.getAllByText('01/03/2026')).toHaveLength(2)
    expect(screen.getAllByText('25/11/2026')).toHaveLength(2)
    expect(screen.getByRole('combobox', { name: 'Filtrar por turno' })).toBeInTheDocument()
    expect(
      screen.queryByRole('combobox', { name: /cadastro ativo ou inativo/i })
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar por turno' }), {
      target: { value: 'NIGHT' },
    })
    expect(screen.queryByText('Aluno da Manhã')).not.toBeInTheDocument()
    expect(screen.getByText('Aluno da Noite')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /Escala semanal/i }))
    expect(screen.getByText('Vigência do contrato')).toBeInTheDocument()
    expect(screen.getByText('25/11/2026')).toBeInTheDocument()
  })
})
