/**
 * Biblioteca de feriados nacionais brasileiros
 * Inclui feriados fixos e móveis (calculados)
 */

import { prisma } from './prisma'

interface HolidayDef {
    name: string
    date: string // formato: 'MM-DD' para fixos
    type: 'fixed' | 'mobile'
}

// Feriados fixos nacionais, estaduais (CE) e municipais (Fortaleza)
const FIXED_HOLIDAYS: HolidayDef[] = [
    { name: 'Confraternização Universal', date: '01-01', type: 'fixed' },
    { name: 'Data Magna do Ceará', date: '03-25', type: 'fixed' }, // Estadual CE
    { name: 'Tiradentes', date: '04-21', type: 'fixed' },
    { name: 'Dia do Trabalho', date: '05-01', type: 'fixed' },
    { name: 'Nossa Senhora da Assunção', date: '08-15', type: 'fixed' }, // Municipal Fortaleza
    { name: 'Independência do Brasil', date: '09-07', type: 'fixed' },
    { name: 'Nossa Senhora Aparecida', date: '10-12', type: 'fixed' },
    { name: 'Finados', date: '11-02', type: 'fixed' },
    { name: 'Proclamação da República', date: '11-15', type: 'fixed' },
    { name: 'Consciência Negra', date: '11-20', type: 'fixed' },
    { name: 'Natal', date: '12-25', type: 'fixed' }
]

/**
 * Calcula a data da Páscoa usando o algoritmo de Meeus/Jones/Butcher
 */
function calculateEaster(year: number): Date {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = ((h + l - 7 * m + 114) % 31) + 1

    return new Date(year, month - 1, day)
}

/**
 * Calcula feriados móveis para um ano específico
 */
function getMobileHolidays(year: number): { name: string; date: Date }[] {
    const easter = calculateEaster(year)
    const holidays: { name: string; date: Date }[] = []

    const carnival = new Date(easter)
    carnival.setDate(easter.getDate() - 47)
    holidays.push({ name: 'Carnaval', date: carnival })

    const goodFriday = new Date(easter)
    goodFriday.setDate(easter.getDate() - 2)
    holidays.push({ name: 'Sexta-feira Santa', date: goodFriday })

    const corpusChristi = new Date(easter)
    corpusChristi.setDate(easter.getDate() + 60)
    holidays.push({ name: 'Corpus Christi', date: corpusChristi })

    return holidays
}

/**
 * Verifica se uma data é feriado (Nacional, Estadual, Municipal ou Banco de Dados)
 */
export async function isHoliday(date: Date): Promise<{ isHoliday: boolean; holidayName?: string }> {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${month}-${day}`

    // 1. Verificar feriados fixos
    const fixedHoliday = FIXED_HOLIDAYS.find(h => h.date === dateKey)
    if (fixedHoliday) {
        return { isHoliday: true, holidayName: fixedHoliday.name }
    }

    // 2. Verificar feriados móveis
    const mobileHolidays = getMobileHolidays(year)
    const mobileHoliday = mobileHolidays.find(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getFullYear() === date.getFullYear()
    )

    if (mobileHoliday) {
        return { isHoliday: true, holidayName: mobileHoliday.name }
    }

    // 3. Verificar feriados customizados no Banco de Dados
    try {
        const dbHoliday = await (prisma as any).holiday.findFirst({
            where: {
                date: {
                    gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
                    lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
                },
                isActive: true
            }
        })

        if (dbHoliday) {
            return { isHoliday: true, holidayName: dbHoliday.name }
        }
    } catch (error) {
        // Ignorar erro se a tabela ainda não existir (antes da migração)
    }

    return { isHoliday: false }
}

/**
 * @deprecated Use isHoliday(date) async instead
 */
export function isNationalHoliday(date: Date): { isHoliday: boolean; holidayName?: string } {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${month}-${day}`

    const fixedHoliday = FIXED_HOLIDAYS.find(h => h.date === dateKey)
    if (fixedHoliday) return { isHoliday: true, holidayName: fixedHoliday.name }

    const mobileHolidays = getMobileHolidays(year)
    const mobileHoliday = mobileHolidays.find(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getFullYear() === date.getFullYear()
    )

    return mobileHoliday ? { isHoliday: true, holidayName: mobileHoliday.name } : { isHoliday: false }
}

/**
 * Busca todos os feriados (fixos, móveis e DB) em um intervalo de datas
 */
export async function getHolidaysForPeriod(startDate: Date, endDate: Date): Promise<Map<string, string>> {
    const holidayMap = new Map<string, string>()
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()

    // 1. Coletar feriados fixos e móveis para todos os anos do intervalo
    for (let year = startYear; year <= endYear; year++) {
        // Fixos
        FIXED_HOLIDAYS.forEach(h => {
            const dateStr = `${year}-${h.date}`
            const d = new Date(dateStr + 'T00:00:00')
            if (d >= startDate && d <= endDate) {
                holidayMap.set(d.toISOString().split('T')[0], h.name)
            }
        })

        // Móveis
        getMobileHolidays(year).forEach(h => {
            if (h.date >= startDate && h.date <= endDate) {
                holidayMap.set(h.date.toISOString().split('T')[0], h.name)
            }
        })
    }

    // 2. Coletar feriados do Banco de Dados
    try {
        const dbHolidays = await (prisma as any).holiday.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
                isActive: true
            }
        })

        dbHolidays.forEach((h: any) => {
            holidayMap.set(h.date.toISOString().split('T')[0], h.name)
        })
    } catch (e) {
        // Ignorar se a tabela não existir
    }

    return holidayMap
}

export function getYearHolidays(year: number): { name: string; date: Date; type: 'fixed' | 'mobile' }[] {
    const holidays: { name: string; date: Date; type: 'fixed' | 'mobile' }[] = []

    FIXED_HOLIDAYS.forEach(h => {
        const [month, day] = h.date.split('-').map(Number)
        holidays.push({
            name: h.name,
            date: new Date(year, month - 1, day),
            type: 'fixed'
        })
    })

    const mobileHolidays = getMobileHolidays(year)
    mobileHolidays.forEach(h => {
        holidays.push({
            name: h.name,
            date: h.date,
            type: 'mobile'
        })
    })

    holidays.sort((a, b) => a.date.getTime() - b.date.getTime())
    return holidays
}

export function isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay()
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6
    const { isHoliday: holiday } = isNationalHoliday(date)
    return !isWeekendDay && !holiday
}

export function getNextWorkingDay(date: Date): Date {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    while (!isWorkingDay(nextDay)) {
        nextDay.setDate(nextDay.getDate() + 1)
    }
    return nextDay
}
