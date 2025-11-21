'use client'

import { useEffect, useState } from 'react'
import { Calendar, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface Holiday {
    name: string
    date: string
    formattedDate: string
    dayOfWeek: string
}

export function HolidayNotification() {
    const [upcomingHoliday, setUpcomingHoliday] = useState<Holiday | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkHolidays = async () => {
            try {
                const year = new Date().getFullYear()
                const response = await fetch(`/api/holidays?year=${year}`)

                if (response.ok) {
                    const data = await response.json()
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    // Encontrar próximo feriado nos próximos 7 dias
                    const nextWeek = new Date(today)
                    nextWeek.setDate(today.getDate() + 7)

                    const next = data.holidays.find((h: any) => {
                        const hDate = new Date(h.date)
                        return hDate >= today && hDate <= nextWeek
                    })

                    if (next) {
                        setUpcomingHoliday(next)
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar feriados:', error)
            } finally {
                setLoading(false)
            }
        }

        checkHolidays()
    }, [])

    if (loading || !upcomingHoliday) return null

    const isToday = new Date(upcomingHoliday.date).toDateString() === new Date().toDateString()

    return (
        <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center space-x-4">
                <div className="p-2 bg-primary/20 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-white">
                        {isToday ? 'Hoje é Feriado!' : 'Feriado chegando!'}
                    </h3>
                    <p className="text-sm text-neutral-300">
                        <span className="font-medium text-primary">{upcomingHoliday.name}</span>
                        {' '}- {upcomingHoliday.formattedDate} ({upcomingHoliday.dayOfWeek})
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                        O registro de ponto estará bloqueado neste dia, salvo autorização especial.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
