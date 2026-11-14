import {
  parseBRL,
  formatBRL,
  numeroPorExtenso,
  valorPorExtenso,
  valorComExtenso,
} from '@/lib/valor-por-extenso'

describe('parseBRL', () => {
  it.each([
    ['R$ 600,00', 60000],
    ['R$ 1.234,56', 123456],
    ['600', 60000],
    ['1234,5', 123450],
  ])('%s → %i centavos', (input, cents) => {
    expect(parseBRL(input)).toBe(cents)
  })

  it.each(['', 'abc', '12,345', undefined])('rejeita %p', (input) => {
    expect(parseBRL(input)).toBeNull()
  })
})

describe('numeroPorExtenso', () => {
  it.each([
    [1, 'um'],
    [16, 'dezesseis'],
    [21, 'vinte e um'],
    [100, 'cem'],
    [101, 'cento e um'],
    [600, 'seiscentos'],
    [999, 'novecentos e noventa e nove'],
    [1000, 'mil'],
    [1001, 'mil e um'],
    [1200, 'mil e duzentos'],
    [1234, 'mil duzentos e trinta e quatro'],
    [2500, 'dois mil e quinhentos'],
    [1000000, 'um milhão'],
    [2000300, 'dois milhões e trezentos'],
  ])('%i → %s', (n, texto) => {
    expect(numeroPorExtenso(n)).toBe(texto)
  })
})

describe('valorPorExtenso', () => {
  it.each([
    ['R$ 600,00', 'seiscentos reais'],
    ['1,00', 'um real'],
    ['0,50', 'cinquenta centavos'],
    ['R$ 1.234,56', 'mil duzentos e trinta e quatro reais e cinquenta e seis centavos'],
    ['1.000.000,00', 'um milhão de reais'],
  ])('%s → %s', (input, texto) => {
    expect(valorPorExtenso(input)).toBe(texto)
  })
})

describe('valorComExtenso', () => {
  it('não duplica o símbolo da moeda que vem da máscara', () => {
    expect(valorComExtenso('R$ 600,00')).toBe('R$ 600,00 (seiscentos reais)')
  })

  it('devolve o texto original quando não é um valor', () => {
    expect(valorComExtenso('a combinar')).toBe('a combinar')
  })
})
