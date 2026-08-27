import { createCalendarEvent } from '@/lib/google-calendar'

describe('lib/google-calendar: degradação graciosa sem credenciais', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
  })

  it('retorna eventId null e não lança quando as credenciais não estão configuradas', async () => {
    delete process.env.GOOGLE_CALENDAR_CLIENT_EMAIL
    delete process.env.GOOGLE_CALENDAR_PRIVATE_KEY
    delete process.env.GOOGLE_CALENDAR_ID
    jest.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await createCalendarEvent({
      visitId: 'visit-1',
      labSigla: 'LAB-IA',
      labNome: 'Laboratório de IA',
      responsibleName: 'Maria Silva',
      schoolName: 'Escola Estadual Exemplo',
      studentCount: 25,
      visitDate: new Date('2026-09-10'),
      shift: 'MORNING',
    })

    expect(result).toEqual({ eventId: null })
  })
})
