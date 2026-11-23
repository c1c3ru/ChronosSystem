import {
  computeWorkedMinutes,
  filterRowsByStatus,
  groupRecordsByStudentDay,
  parseAttendanceSearchParams,
  rowsToCsv,
  summarizeRows,
  type SearchRecord,
} from '@/lib/attendance-search'

// "Agora" na convenção fake-UTC: 23/11/2026 às 15:00 em Fortaleza.
const NOW = new Date('2026-11-23T15:00:00.000Z')

function params(query: Record<string, string>) {
  return parseAttendanceSearchParams(new URLSearchParams(query), NOW)
}

const aluno = {
  id: 'u1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  registrationNumber: '2024001',
  department: 'CTI-MAR',
}
const outro = { ...aluno, id: 'u2', name: 'Bruno Lima', email: 'bruno@example.com' }

function rec(id: string, user: SearchRecord['user'], type: string, iso: string): SearchRecord {
  return { id, type, timestamp: new Date(iso), user, machine: { name: 'Kiosk', location: 'CTI' } }
}

describe('parseAttendanceSearchParams', () => {
  it('usa os últimos 7 dias de Fortaleza quando não há datas', () => {
    const r = params({})
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.params.fromKey).toBe('2026-11-17')
    expect(r.params.toKey).toBe('2026-11-23')
    expect(r.params.from.toISOString()).toBe('2026-11-17T00:00:00.000Z')
    expect(r.params.to.toISOString()).toBe('2026-11-23T23:59:59.999Z')
    expect(r.params.department).toBeNull()
    expect(r.params.status).toBe('ALL')
  })

  it('aceita período, setor, situação e paginação', () => {
    const r = params({
      q: '  ana ',
      from: '2026-11-01',
      to: '2026-11-10',
      department: 'CTI-MAR',
      status: 'OPEN',
      page: '3',
      limit: '9999',
    })
    expect(r.ok && r.params).toMatchObject({
      q: 'ana',
      fromKey: '2026-11-01',
      toKey: '2026-11-10',
      department: 'CTI-MAR',
      status: 'OPEN',
      page: 3,
      limit: 200,
    })
  })

  it.each([
    [{ from: '2026-13-01' }, 'Data inicial inválida'],
    [{ to: '23/11/2026' }, 'Data final inválida'],
    [{ from: '2026-11-20', to: '2026-11-10' }, 'anterior ou igual'],
    [{ from: '2026-01-01', to: '2026-11-10' }, 'período máximo'],
  ])('rejeita %p', (query, message) => {
    const r = params(query)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain(message)
  })
})

describe('computeWorkedMinutes', () => {
  it('pareia entrada e saída e ignora entrada duplicada', () => {
    const r = computeWorkedMinutes([
      { type: 'ENTRY', timestamp: new Date('2026-11-23T08:00:00Z') },
      { type: 'ENTRY', timestamp: new Date('2026-11-23T08:02:00Z') },
      { type: 'EXIT', timestamp: new Date('2026-11-23T10:00:00Z') },
      { type: 'EXIT', timestamp: new Date('2026-11-23T10:05:00Z') },
      { type: 'ENTRY', timestamp: new Date('2026-11-23T10:30:00Z') },
      { type: 'EXIT', timestamp: new Date('2026-11-23T12:15:00Z') },
    ])
    expect(r).toEqual({ workedMinutes: 120 + 105, open: false })
  })

  it('marca o dia como aberto quando falta a saída', () => {
    expect(
      computeWorkedMinutes([{ type: 'ENTRY', timestamp: new Date('2026-11-23T08:00:00Z') }])
    ).toEqual({ workedMinutes: 0, open: true })
  })
})

describe('groupRecordsByStudentDay', () => {
  const records = [
    rec('1', aluno, 'EXIT', '2026-11-22T12:00:00Z'),
    rec('2', aluno, 'ENTRY', '2026-11-22T08:10:00Z'),
    rec('3', outro, 'ENTRY', '2026-11-22T13:00:00Z'),
    // Registro às 22:30 de Fortaleza continua no mesmo dia (fake-UTC).
    rec('4', aluno, 'ENTRY', '2026-11-23T22:30:00Z'),
  ]

  it('agrupa por aluno e dia, do dia mais recente para o mais antigo', () => {
    const rows = groupRecordsByStudentDay(records)
    expect(rows.map((r) => [r.date, r.name])).toEqual([
      ['2026-11-23', 'Ana Souza'],
      ['2026-11-22', 'Ana Souza'],
      ['2026-11-22', 'Bruno Lima'],
    ])
    expect(rows[1]).toMatchObject({
      firstEntry: '08:10',
      lastExit: '12:00',
      workedMinutes: 230,
      open: false,
      entries: 1,
      exits: 1,
    })
    expect(rows[1].punches.map((p) => `${p.type} ${p.time}`)).toEqual(['ENTRY 08:10', 'EXIT 12:00'])
    expect(rows[0]).toMatchObject({ firstEntry: '22:30', lastExit: null, open: true })
  })

  it('filtra pela situação do dia e resume', () => {
    const rows = groupRecordsByStudentDay(records)
    expect(filterRowsByStatus(rows, 'OPEN')).toHaveLength(2)
    expect(filterRowsByStatus(rows, 'COMPLETE')).toHaveLength(1)
    expect(summarizeRows(rows)).toEqual({
      rows: 3,
      students: 2,
      entries: 3,
      exits: 1,
      openDays: 2,
      workedMinutes: 230,
    })
  })

  it('gera CSV com ";" e neutraliza fórmulas', () => {
    const hacker = { ...aluno, id: 'u3', name: '=HYPERLINK("x")' }
    const csv = rowsToCsv(
      groupRecordsByStudentDay([rec('9', hacker, 'ENTRY', '2026-11-22T08:00Z')])
    )
    const [header, line] = csv.replace('﻿', '').split('\r\n')
    expect(header.startsWith('Data;Aluno;Matrícula')).toBe(true)
    expect(line).toContain('22/11/2026;"\'=HYPERLINK(""x"")";2024001')
    expect(line).toContain('Sem saída')
  })
})
