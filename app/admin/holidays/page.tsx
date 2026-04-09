'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight, MapPin, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface Holiday {
  name: string
  date: string // ISO string
  formattedDate: string
  type: 'fixed' | 'mobile'
  dayOfWeek: string
}

interface HolidayData {
  year: number
  holidays: Holiday[]
  today: {
    isHoliday: boolean
    holidayName?: string
    isWorkingDay: boolean
  }
}

export default function HolidaysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<HolidayData | null>(null)

  // A proteção de rota agora é feita EXCLUSIVAMENTE pelo middleware.
  // Isso evita loops de redirecionamento quando a sessão do cliente demora a sincronizar.

  // Load holidays
  useEffect(() => {
    if (session && ['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
      loadHolidays(year)
    }
  }, [session, year])

  const loadHolidays = async (targetYear: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/holidays?year=${targetYear}`)

      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao carregar feriados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNextHoliday = () => {
    if (!data) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return data.holidays.find((h) => new Date(h.date) >= today)
  }

  const nextHoliday = getNextHoliday()

  if (status === 'loading' || (loading && !data)) {
    return <Loading />
  }

  // Fallback visual caso o middleware falhe e o usuário não tenha permissão
  if (!session || !['ADMIN', 'SUPERVISOR'].includes(session.user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4 font-outfit">Acesso Restrito</h1>
        <p className="text-neutral-400 mb-6 text-center max-w-md font-outfit">
          Você não tem permissão para acessar esta área ou sua sessão expirou.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => (window.location.href = '/employee')} variant="secondary">
            Ir para Área do Funcionário
          </Button>
          <Button onClick={() => signIn()} variant="primary">
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 border-b border-neutral-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Calendário de Feriados</h1>
                <p className="text-neutral-400">Feriados nacionais, estaduais e municipais</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Year Navigation */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <Button variant="ghost" onClick={() => setYear(year - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold text-white">{year}</h2>
          <Button variant="ghost" onClick={() => setYear(year + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Next Holiday Card */}
          <Card className="md:col-span-1 bg-primary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Calendar className="h-5 w-5 mr-2" />
                Próximo Feriado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextHoliday ? (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{nextHoliday.name}</h3>
                  <p className="text-lg text-neutral-300 capitalize">{nextHoliday.formattedDate}</p>
                  <div className="mt-4 flex items-center text-sm text-neutral-400">
                    <Info className="h-4 w-4 mr-1" />
                    <span>{nextHoliday.type === 'fixed' ? 'Data fixa' : 'Data móvel'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-400">Nenhum feriado restante este ano.</p>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-neutral-300">
                <p>
                  O sistema bloqueia automaticamente registros de ponto em feriados nacionais e
                  finais de semana.
                </p>
                <p>
                  Para permitir trabalho nestes dias, é necessário criar uma justificativa do tipo{' '}
                  <strong>EXTRA_WORK</strong> previamente aprovada.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-neutral-700 rounded text-xs">Nacional</span>
                  <span className="px-2 py-1 bg-neutral-700 rounded text-xs">Estadual (CE)</span>
                  <span className="px-2 py-1 bg-neutral-700 rounded text-xs">
                    Municipal (Fortaleza)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holidays List */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.holidays.map((holiday, index) => {
            const isPast = new Date(holiday.date) < new Date(new Date().setHours(0, 0, 0, 0))
            const isToday = new Date(holiday.date).toDateString() === new Date().toDateString()

            return (
              <Card
                key={index}
                className={`${isToday ? 'border-primary ring-1 ring-primary' : isPast ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-bold mb-1 ${isToday ? 'text-primary' : 'text-white'}`}>
                        {holiday.name}
                      </h3>
                      <p className="text-neutral-300 capitalize">{holiday.formattedDate}</p>
                      <p className="text-sm text-neutral-500 capitalize mt-1">
                        {holiday.dayOfWeek}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {holiday.name.includes('Ceará') && (
                        <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded mb-1">
                          Estadual
                        </span>
                      )}
                      {holiday.name.includes('Fortaleza') && (
                        <span className="text-xs bg-green-900/50 text-green-200 px-2 py-1 rounded mb-1">
                          Municipal
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
