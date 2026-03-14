import {
    determineRecordType,
    detectLateArrival,
    detectEarlyDeparture,
    analyzeDayForJustification,
    validateRecord,
    isWeekend,
    DEFAULT_WORKING_HOURS
} from '@/lib/attendance-logic'

describe('attendance-logic', () => {
    describe('determineRecordType', () => {
        const workingHours = DEFAULT_WORKING_HOURS
        const userId = 'test-user-123'

        it('deve retornar ENTRY para primeiro registro', () => {
            const result = determineRecordType({
                userId,
                currentTime: new Date('2024-01-15T08:00:00'),
                lastRecord: null,
                workingHours
            })

            expect(result.type).toBe('ENTRY')
            expect(result.confidence).toBe('high')
            expect(result.reason).toContain('Primeiro registro')
        })

        it('deve retornar ENTRY para novo dia de trabalho', () => {
            const result = determineRecordType({
                userId,
                currentTime: new Date('2024-01-16T08:00:00'),
                lastRecord: {
                    type: 'EXIT',
                    timestamp: new Date('2024-01-15T17:00:00')
                },
                workingHours
            })

            expect(result.type).toBe('ENTRY')
            expect(result.confidence).toBe('high')
            expect(result.reason).toContain('Novo dia')
        })

        it('deve retornar EXIT após ENTRY dentro de 12 horas', () => {
            const entryTime = new Date('2024-01-15T08:00:00')
            const exitTime = new Date('2024-01-15T12:00:00')

            const result = determineRecordType({
                userId,
                currentTime: exitTime,
                lastRecord: {
                    type: 'ENTRY',
                    timestamp: entryTime
                },
                workingHours
            })

            expect(result.type).toBe('EXIT')
            expect(result.confidence).toBe('high')
        })

        it('deve retornar ENTRY após mais de 12 horas do último registro', () => {
            const lastExit = new Date('2024-01-15T17:00:00')
            const nextEntry = new Date('2024-01-16T08:00:00')

            const result = determineRecordType({
                userId,
                currentTime: nextEntry,
                lastRecord: {
                    type: 'EXIT',
                    timestamp: lastExit
                },
                workingHours
            })

            expect(result.type).toBe('ENTRY')
            expect(result.confidence).toBe('high')
        })

        it('deve detectar saída para almoço', () => {
            const result = determineRecordType({
                userId,
                currentTime: new Date('2024-01-15T12:00:00'),
                lastRecord: {
                    type: 'ENTRY',
                    timestamp: new Date('2024-01-15T08:00:00')
                },
                workingHours
            })

            expect(result.type).toBe('EXIT')
            expect(result.reason).toContain('almoço')
        })

        it('deve detectar retorno do almoço', () => {
            const result = determineRecordType({
                userId,
                currentTime: new Date('2024-01-15T13:00:00'),
                lastRecord: {
                    type: 'EXIT',
                    timestamp: new Date('2024-01-15T12:00:00')
                },
                workingHours
            })

            expect(result.type).toBe('ENTRY')
            expect(result.reason).toContain('almoço')
        })

        it('deve detectar saída do expediente', () => {
            const result = determineRecordType({
                userId,
                currentTime: new Date('2024-01-15T17:00:00'),
                lastRecord: {
                    type: 'ENTRY',
                    timestamp: new Date('2024-01-15T13:00:00')
                },
                workingHours
            })

            expect(result.type).toBe('EXIT')
            expect(result.reason).toContain('expediente')
        })

        it('deve detectar hora extra', () => {
            const result = determineRecordType({
                userId,
                currentTime: new Date('2024-01-15T19:00:00'),
                lastRecord: {
                    type: 'ENTRY',
                    timestamp: new Date('2024-01-15T08:00:00')
                },
                workingHours
            })

            expect(result.type).toBe('EXIT')
            expect(result.reason).toContain('hora extra')
        })
    })

    describe('detectLateArrival', () => {
        const workingHours = DEFAULT_WORKING_HOURS

        it('não deve detectar atraso para entrada no horário', () => {
            const entryTime = new Date('2024-01-15T08:00:00')
            const result = detectLateArrival(entryTime, workingHours)

            expect(result.isLate).toBe(false)
            expect(result.minutesLate).toBe(0)
            expect(result.requiresJustification).toBe(false)
        })

        it('deve detectar atraso de 15 minutos sem justificativa', () => {
            const entryTime = new Date('2024-01-15T08:15:00')
            const result = detectLateArrival(entryTime, workingHours)

            expect(result.isLate).toBe(true)
            expect(result.minutesLate).toBe(15)
            expect(result.requiresJustification).toBe(false)
        })

        it('deve detectar atraso de 45 minutos com justificativa', () => {
            const entryTime = new Date('2024-01-15T08:45:00')
            const result = detectLateArrival(entryTime, workingHours)

            expect(result.isLate).toBe(true)
            expect(result.minutesLate).toBe(45)
            expect(result.requiresJustification).toBe(true)
        })

        it('não deve detectar atraso para entrada antecipada', () => {
            const entryTime = new Date('2024-01-15T07:45:00')
            const result = detectLateArrival(entryTime, workingHours)

            expect(result.isLate).toBe(false)
            expect(result.minutesLate).toBe(0)
        })
    })

    describe('detectEarlyDeparture', () => {
        const workingHours = DEFAULT_WORKING_HOURS
        const expectedDailyHours = 8

        it('não deve detectar saída antecipada para jornada completa', () => {
            const entryTime = new Date('2024-01-15T08:00:00')
            const exitTime = new Date('2024-01-15T17:00:00')

            const result = detectEarlyDeparture(entryTime, exitTime, workingHours, expectedDailyHours)

            expect(result.isEarly).toBe(false)
            expect(result.requiresJustification).toBe(false)
            expect(result.hoursWorked).toBeGreaterThanOrEqual(8)
        })

        it('deve detectar saída antecipada de 5 minutos sem justificativa', () => {
            const entryTime = new Date('2024-01-15T08:00:00')
            const exitTime = new Date('2024-01-15T16:55:00')

            const result = detectEarlyDeparture(entryTime, exitTime, workingHours, expectedDailyHours)

            expect(result.isEarly).toBe(true)
            expect(result.minutesShort).toBeGreaterThan(0)
            expect(result.requiresJustification).toBe(false)
        })

        it('deve detectar saída antecipada de 30 minutos com justificativa', () => {
            const entryTime = new Date('2024-01-15T08:00:00')
            const exitTime = new Date('2024-01-15T16:30:00')

            const result = detectEarlyDeparture(entryTime, exitTime, workingHours, expectedDailyHours)

            expect(result.isEarly).toBe(true)
            expect(result.minutesShort).toBeGreaterThan(10)
            expect(result.requiresJustification).toBe(true)
        })

        it('deve descontar horário de almoço corretamente', () => {
            const entryTime = new Date('2024-01-15T08:00:00')
            const exitTime = new Date('2024-01-15T18:00:00') // 10 horas total

            const result = detectEarlyDeparture(entryTime, exitTime, workingHours, expectedDailyHours)

            // 10 horas - 1 hora de almoço = 9 horas trabalhadas
            expect(result.hoursWorked).toBeCloseTo(9, 1)
            expect(result.isEarly).toBe(false)
        })
    })

    describe('analyzeDayForJustification', () => {
        const workingHours = DEFAULT_WORKING_HOURS
        const date = new Date('2024-01-15')

        it('deve detectar falta completa', () => {
            const result = analyzeDayForJustification(
                date,
                null,
                null,
                workingHours,
                true
            )

            expect(result.requiresJustification).toBe(true)
            expect(result.justificationReason).toContain('Falta')
            expect(result.hasEntry).toBe(false)
            expect(result.hasExit).toBe(false)
        })

        it('não deve exigir justificativa em dia não útil', () => {
            const result = analyzeDayForJustification(
                date,
                null,
                null,
                workingHours,
                false // não é dia de trabalho
            )

            expect(result.requiresJustification).toBe(false)
        })

        it('deve detectar atraso significativo', () => {
            const entryRecord = { timestamp: new Date('2024-01-15T09:00:00') }
            const exitRecord = { timestamp: new Date('2024-01-15T17:00:00') }

            const result = analyzeDayForJustification(
                date,
                entryRecord,
                exitRecord,
                workingHours,
                true
            )

            expect(result.lateArrival).toBeDefined()
            expect(result.lateArrival?.minutesLate).toBeGreaterThan(30)
            expect(result.requiresJustification).toBe(true)
        })

        it('deve detectar saída antecipada', () => {
            const entryRecord = { timestamp: new Date('2024-01-15T08:00:00') }
            const exitRecord = { timestamp: new Date('2024-01-15T15:00:00') }

            const result = analyzeDayForJustification(
                date,
                entryRecord,
                exitRecord,
                workingHours,
                true
            )

            expect(result.earlyDeparture).toBeDefined()
            expect(result.requiresJustification).toBe(true)
        })

        it('deve detectar registro incompleto (sem saída)', () => {
            const yesterday = new Date('2024-01-14')
            const entryRecord = { timestamp: new Date('2024-01-14T08:00:00') }

            const result = analyzeDayForJustification(
                yesterday,
                entryRecord,
                null,
                workingHours,
                true
            )

            expect(result.requiresJustification).toBe(true)
            expect(result.justificationReason).toContain('saída')
        })

        it('não deve exigir justificativa para dia completo e correto', () => {
            const entryRecord = { timestamp: new Date('2024-01-15T08:00:00') }
            const exitRecord = { timestamp: new Date('2024-01-15T17:00:00') }

            const result = analyzeDayForJustification(
                date,
                entryRecord,
                exitRecord,
                workingHours,
                true
            )

            expect(result.requiresJustification).toBe(false)
            expect(result.isComplete).toBe(true)
        })
    })

    describe('validateRecord', () => {
        const workingHours = DEFAULT_WORKING_HOURS
        const userId = 'test-user-123'

        it('deve permitir registro em dia útil normal', async () => {
            const result = await validateRecord({
                userId,
                currentTime: new Date('2024-01-15T08:00:00'), // Segunda-feira
                lastRecord: null,
                workingHours
            }, 'ENTRY')

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('deve bloquear registro em fim de semana sem autorização', async () => {
            const result = await validateRecord({
                userId,
                currentTime: new Date('2024-01-13T08:00:00'), // Sábado
                lastRecord: null,
                workingHours,
                hasAuthorization: false
            }, 'ENTRY')

            expect(result.isValid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.errors[0]).toContain('sábado')
        })

        it('deve permitir registro em fim de semana com autorização', async () => {
            const result = await validateRecord({
                userId,
                currentTime: new Date('2024-01-13T08:00:00'), // Sábado
                lastRecord: null,
                workingHours,
                hasAuthorization: true
            }, 'ENTRY')

            expect(result.isValid).toBe(true)
        })

        it('deve bloquear registros muito próximos', async () => {
            const lastTime = new Date('2024-01-15T08:00:00')
            const currentTime = new Date('2024-01-15T08:02:00') // 2 minutos depois

            const result = await validateRecord({
                userId,
                currentTime,
                lastRecord: {
                    type: 'ENTRY',
                    timestamp: lastTime
                },
                workingHours
            }, 'EXIT')

            expect(result.isValid).toBe(false)
            expect(result.errors.some(e => e.includes('muito próximo'))).toBe(true)
        })

        it('deve gerar warning para horário não convencional', async () => {
            const result = await validateRecord({
                userId,
                currentTime: new Date('2024-01-15T23:00:00'), // 23h
                lastRecord: null,
                workingHours
            }, 'ENTRY')

            expect(result.warnings.length).toBeGreaterThan(0)
            expect(result.warnings[0]).toContain('não convencional')
        })
    })

    describe('isWeekend', () => {
        it('deve detectar sábado como fim de semana', () => {
            const saturday = new Date('2024-01-13T12:00:00') // Sábado
            expect(isWeekend(saturday)).toBe(true)
        })

        it('deve detectar domingo como fim de semana', () => {
            const sunday = new Date('2024-01-14T12:00:00') // Domingo
            expect(isWeekend(sunday)).toBe(true)
        })

        it('não deve detectar segunda-feira como fim de semana', () => {
            const monday = new Date('2024-01-15T12:00:00') // Segunda
            expect(isWeekend(monday)).toBe(false)
        })

        it('não deve detectar sexta-feira como fim de semana', () => {
            const friday = new Date('2024-01-19T12:00:00') // Sexta
            expect(isWeekend(friday)).toBe(false)
        })
    })
})
