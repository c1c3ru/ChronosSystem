/**
 * Biblioteca de feriados nacionais brasileiros
 * Inclui feriados fixos e móveis (calculados)
 */

interface Holiday {
    name: string
    date: string // formato: 'MM-DD' para fixos
    type: 'fixed' | 'mobile'
}

// Feriados fixos nacionais, estaduais (CE) e municipais (Fortaleza)
const FIXED_HOLIDAYS: Holiday[] = [
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
 * @param year Ano para calcular a Páscoa
 * @returns Data da Páscoa
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
 * @param year Ano
 * @returns Array de datas de feriados móveis
 */
function getMobileHolidays(year: number): { name: string; date: Date }[] {
    const easter = calculateEaster(year)
    const holidays: { name: string; date: Date }[] = []

    // Carnaval (47 dias antes da Páscoa)
    const carnival = new Date(easter)
    carnival.setDate(easter.getDate() - 47)
    holidays.push({ name: 'Carnaval', date: carnival })

    // Sexta-feira Santa (2 dias antes da Páscoa)
    const goodFriday = new Date(easter)
    goodFriday.setDate(easter.getDate() - 2)
    holidays.push({ name: 'Sexta-feira Santa', date: goodFriday })

    // Corpus Christi (60 dias depois da Páscoa)
    const corpusChristi = new Date(easter)
    corpusChristi.setDate(easter.getDate() + 60)
    holidays.push({ name: 'Corpus Christi', date: corpusChristi })

    return holidays
}

/**
 * Verifica se uma data é feriado nacional
 * @param date Data para verificar
 * @returns Objeto com informação se é feriado e nome do feriado
 */
export function isNationalHoliday(date: Date): { isHoliday: boolean; holidayName?: string } {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${month}-${day}`

    // Verificar feriados fixos
    const fixedHoliday = FIXED_HOLIDAYS.find(h => h.date === dateKey)
    if (fixedHoliday) {
        return { isHoliday: true, holidayName: fixedHoliday.name }
    }

    // Verificar feriados móveis
    const mobileHolidays = getMobileHolidays(year)
    const mobileHoliday = mobileHolidays.find(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth() &&
        h.date.getFullYear() === date.getFullYear()
    )

    if (mobileHoliday) {
        return { isHoliday: true, holidayName: mobileHoliday.name }
    }

    return { isHoliday: false }
}

/**
 * Obtém todos os feriados de um ano
 * @param year Ano
 * @returns Array com todos os feriados do ano
 */
export function getYearHolidays(year: number): { name: string; date: Date; type: 'fixed' | 'mobile' }[] {
    const holidays: { name: string; date: Date; type: 'fixed' | 'mobile' }[] = []

    // Adicionar feriados fixos
    FIXED_HOLIDAYS.forEach(h => {
        const [month, day] = h.date.split('-').map(Number)
        holidays.push({
            name: h.name,
            date: new Date(year, month - 1, day),
            type: 'fixed'
        })
    })

    // Adicionar feriados móveis
    const mobileHolidays = getMobileHolidays(year)
    mobileHolidays.forEach(h => {
        holidays.push({
            name: h.name,
            date: h.date,
            type: 'mobile'
        })
    })

    // Ordenar por data
    holidays.sort((a, b) => a.date.getTime() - b.date.getTime())

    return holidays
}

/**
 * Verifica se uma data é dia útil (não é fim de semana nem feriado)
 * @param date Data para verificar
 * @returns true se for dia útil
 */
export function isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const { isHoliday } = isNationalHoliday(date)

    return !isWeekend && !isHoliday
}

/**
 * Obtém o próximo dia útil a partir de uma data
 * @param date Data de referência
 * @returns Próximo dia útil
 */
export function getNextWorkingDay(date: Date): Date {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    while (!isWorkingDay(nextDay)) {
        nextDay.setDate(nextDay.getDate() + 1)
    }

    return nextDay
}
