import { describe, expect, it } from 'vitest'
import { simpleAuthProvider } from '../src/providers/auth'

describe('simpleAuthProvider', () => {
  it('maps permissionKey into auth.permissions when provided', async () => {
    const provider = simpleAuthProvider({
      permissionKey: 'rules',
    })

    const context = {
      request: {
        async request() {
          return {
            status: 200,
            data: {
              message: 'ok',
              data: {
                token: 'token-1',
                rules: ['post.read', 'post.write'],
              },
            },
          }
        },
      },
    } as any

    const result = await provider.login({
      username: 'demo',
      password: 'demo123',
    }, context)

    expect(result.success).toBe(true)
    expect(result.data?.permissions).toEqual(['post.read', 'post.write'])
  })

  it('supports method and path overrides for auth requests', async () => {
    const calls: Array<{ url: string, method?: string, data?: unknown, query?: unknown }> = []
    const provider = simpleAuthProvider({
      path: {
        login: '/login',
        check: '/check',
      },
      method: {
        login: 'POST',
        check: 'GET',
      },
    })

    const context = {
      request: {
        async request(input: any) {
          calls.push({
            url: input.url,
            method: input.method,
            data: input.data,
            query: input.query,
          })
          return {
            status: 200,
            data: {
              data: {
                token: 'token-1',
              },
            },
          }
        },
      },
      session: {
        getAuth() {
          return {
            token: 'token-1',
          }
        },
      },
    } as any

    await provider.login({
      username: 'demo',
    }, context, {
      path: '/passport/login',
      method: 'PATCH',
    })

    await provider.check?.({
      scene: 'launch',
    }, context, {
      token: 'token-1',
    }, {
      path: '/passport/check',
      method: 'POST',
    })

    expect(calls).toEqual([
      {
        url: '/passport/login',
        method: 'PATCH',
        data: {
          username: 'demo',
        },
        query: undefined,
      },
      {
        url: '/passport/check',
        method: 'POST',
        data: {
          scene: 'launch',
        },
        query: undefined,
      },
    ])
  })
})
