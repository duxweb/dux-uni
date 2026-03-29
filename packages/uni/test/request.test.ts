import { describe, expect, it } from 'vitest'
import { createRequestClient } from '../src/runtime/request'

describe('createRequestClient', () => {
  it('merges base url, query, and headers', async () => {
    const requests: any[] = []
    const client = createRequestClient({
      baseURL: 'https://api.example.com',
      getHeaders: () => ({ Authorization: 'token-a' }),
      adapter: {
        async request(options) {
          requests.push(options)
          return {
            status: 200,
            data: { ok: true },
          } as any
        },
      },
    })

    const response = await client.request({
      url: '/users',
      query: { page: 1, pageSize: 20 },
      headers: { 'X-Test': '1' },
    })

    expect(response.data).toEqual({ ok: true })
    expect(requests[0].url).toBe('https://api.example.com/users?page=1&pageSize=20')
    expect(requests[0].headers).toEqual({
      Authorization: 'token-a',
      'X-Test': '1',
    })
  })

  it('applies request.sign before request interceptors', async () => {
    const requests: any[] = []
    const client = createRequestClient({
      baseURL: 'https://api.example.com',
      getHeaders: () => ({ Authorization: 'token-a' }),
      sign: request => ({
        query: {
          ...(request.query || {}),
          ts: '123',
        },
        headers: {
          'X-Sign': `signed:${request.method || 'GET'}:${request.url}`,
        },
      }),
      onRequest: [
        request => ({
          ...request,
          headers: {
            ...(request.headers || {}),
            'X-Trace': 'trace-1',
          },
        }),
      ],
      adapter: {
        async request(options) {
          requests.push(options)
          return {
            status: 200,
            data: { ok: true },
          } as any
        },
      },
    })

    await client.request({
      url: '/orders',
      method: 'POST',
      query: { page: 2 },
      data: { title: 'demo' },
    })

    expect(requests[0].url).toBe('https://api.example.com/orders?page=2&ts=123')
    expect(requests[0].query).toEqual({
      page: 2,
      ts: '123',
    })
    expect(requests[0].headers).toEqual({
      Authorization: 'token-a',
      'X-Sign': 'signed:POST:https://api.example.com/orders',
      'X-Trace': 'trace-1',
    })
  })
})
