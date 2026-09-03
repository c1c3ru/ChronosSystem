import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    cronLog: {
      create: jest.fn(),
    },
  },
}))

import {
  summarizeOutcomes,
  cronHttpStatus,
  runBatchWithAllSettled,
  recordCronLog,
  recordCronError,
} from '@/lib/cron-log'

const mockedCreate = prisma.cronLog.create as jest.Mock

describe('lib/cron-log', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('summarizeOutcomes', () => {
    it('retorna SUCCESS quando não há falhas', () => {
      const summary = summarizeOutcomes(3, [])
      expect(summary).toEqual({
        status: 'SUCCESS',
        totalCount: 3,
        successCount: 3,
        failureCount: 0,
        failures: [],
      })
    })

    it('retorna PARTIAL_FAILURE quando há pelo menos uma falha', () => {
      const failures = [{ email: 'a@example.com', message: 'boom' }]
      const summary = summarizeOutcomes(3, failures)
      expect(summary.status).toBe('PARTIAL_FAILURE')
      expect(summary.successCount).toBe(2)
      expect(summary.failureCount).toBe(1)
    })

    it('retorna PARTIAL_FAILURE (não um status especial) quando 100% falham', () => {
      const failures = [
        { email: 'a@example.com', message: 'boom' },
        { email: 'b@example.com', message: 'boom' },
      ]
      const summary = summarizeOutcomes(2, failures)
      expect(summary.status).toBe('PARTIAL_FAILURE')
      expect(summary.successCount).toBe(0)
      expect(summary.failureCount).toBe(2)
    })
  })

  describe('cronHttpStatus', () => {
    it('mapeia SUCCESS -> 200, PARTIAL_FAILURE -> 207, ERROR -> 500', () => {
      expect(cronHttpStatus('SUCCESS')).toBe(200)
      expect(cronHttpStatus('PARTIAL_FAILURE')).toBe(207)
      expect(cronHttpStatus('ERROR')).toBe(500)
    })
  })

  describe('runBatchWithAllSettled', () => {
    it('processa todos os itens mesmo quando um deles rejeita, e reporta a falha real', async () => {
      const items = ['ok-1', 'fail', 'ok-2']
      const attempted: string[] = []

      const sendOne = jest.fn(async (item: string) => {
        attempted.push(item)
        if (item === 'fail') {
          throw new Error('SMTP indisponível')
        }
        return true
      })

      const summary = await runBatchWithAllSettled(items, sendOne, (item, reason) => ({
        email: item,
        message: reason instanceof Error ? reason.message : String(reason),
      }))

      // Critério de sucesso 1: uma falha simulada não impede o envio dos
      // itens subsequentes — os 3 itens foram tentados, não só até o que falhou.
      expect(attempted).toEqual(['ok-1', 'fail', 'ok-2'])
      expect(summary.status).toBe('PARTIAL_FAILURE')
      expect(summary.totalCount).toBe(3)
      expect(summary.successCount).toBe(2)
      expect(summary.failureCount).toBe(1)
      expect(summary.failures).toEqual([{ email: 'fail', message: 'SMTP indisponível' }])
    })

    it('trata um retorno false (sem exceção) como falha também', async () => {
      const items = ['a', 'b']
      const sendOne = jest.fn(async (item: string) => item !== 'b')

      const summary = await runBatchWithAllSettled(items, sendOne, (item) => ({
        email: item,
        message: 'não configurado',
      }))

      expect(summary.status).toBe('PARTIAL_FAILURE')
      expect(summary.successCount).toBe(1)
      expect(summary.failureCount).toBe(1)
    })

    it('retorna SUCCESS quando todos os itens são enviados', async () => {
      const items = ['a', 'b', 'c']
      const sendOne = jest.fn(async () => true)

      const summary = await runBatchWithAllSettled(items, sendOne, (item) => ({
        email: item,
        message: 'unreachable',
      }))

      expect(summary.status).toBe('SUCCESS')
      expect(summary.failureCount).toBe(0)
      expect(sendOne).toHaveBeenCalledTimes(3)
    })
  })

  describe('recordCronLog / recordCronError', () => {
    it('grava um CronLog com os campos agregados do resumo', async () => {
      mockedCreate.mockResolvedValue({})
      const startedAt = new Date('2026-09-03T12:00:00.000Z')

      await recordCronLog('daily-justification-check', startedAt, {
        status: 'PARTIAL_FAILURE',
        totalCount: 2,
        successCount: 1,
        failureCount: 1,
        failures: [{ email: 'a@example.com', message: 'boom' }],
      })

      expect(mockedCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobName: 'daily-justification-check',
          status: 'PARTIAL_FAILURE',
          startedAt,
          totalCount: 2,
          successCount: 1,
          failureCount: 1,
          errors: JSON.stringify([{ email: 'a@example.com', message: 'boom' }]),
        }),
      })
    })

    it('grava errors=null quando não há falhas', async () => {
      mockedCreate.mockResolvedValue({})
      await recordCronLog('attendance-reminder', new Date(), {
        status: 'SUCCESS',
        totalCount: 1,
        successCount: 1,
        failureCount: 0,
        failures: [],
      })

      expect(mockedCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ errors: null }),
      })
    })

    it('recordCronError grava status ERROR com a mensagem da exceção', async () => {
      mockedCreate.mockResolvedValue({})
      const startedAt = new Date()

      await recordCronError('attendance-reminder', startedAt, new Error('DB indisponível'))

      expect(mockedCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobName: 'attendance-reminder',
          status: 'ERROR',
          startedAt,
          errorMessage: 'DB indisponível',
        }),
      })
    })

    it('nunca deixa uma falha ao gravar o log lançar para o chamador', async () => {
      mockedCreate.mockRejectedValue(new Error('conexão perdida'))

      await expect(
        recordCronLog('attendance-reminder', new Date(), {
          status: 'SUCCESS',
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          failures: [],
        })
      ).resolves.toBeUndefined()
    })
  })
})
