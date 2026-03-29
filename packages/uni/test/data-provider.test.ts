import { describe, expect, it } from 'vitest'
import { simpleDataProvider } from '../src/providers/data'

describe('simpleDataProvider', () => {
  it('unwraps common response envelopes', async () => {
    const provider = simpleDataProvider()
    const result = await provider.getList({
      path: 'demo/cards',
    }, {
      config: {},
      request: {
        request: async () => ({
          status: 200,
          data: {
            message: 'ok',
            data: [{ id: 1 }],
            meta: { total: 1 },
          },
        }),
      },
    } as any, null)

    expect(result.message).toBe('ok')
    expect(result.data).toEqual([{ id: 1 }])
    expect(result.meta).toEqual({ total: 1 })
    expect(provider.getTotal(result)).toBe(1)
  })
})
