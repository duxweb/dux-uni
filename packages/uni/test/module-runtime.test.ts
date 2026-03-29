import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import {
  createSocketBridge,
  createMemoryStorageAdapter,
  createUni,
  defineUniConfig,
  defineUniModule,
} from '../src'

describe('module runtime', () => {
  it('registers config patches, hooks, listeners, middlewares, and lifecycle stages in module order', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const calls: string[] = []
    const app = createUni(defineUniConfig({
      appName: 'module-runtime-test',
      storage: createMemoryStorageAdapter(),
      modules: [
        defineUniModule({
          name: 'base',
          config: {
            apiBaseURL: 'https://api.example.com',
          },
          hooks: {
            'demo.collect': (payload) => {
              calls.push(`hook:${String(payload)}`)
              return `${String(payload)}-handled`
            },
          },
          listeners: {
            'session:changed': (payload) => {
              calls.push(`event:${String(payload)}`)
            },
          },
          lifecycle: {
            register({ extendConfig }) {
              calls.push('register:base')
              extendConfig({
                request: {
                  timeout: 2500,
                },
              })
            },
            init() {
              calls.push('init:base')
            },
            boot() {
              calls.push('boot:base')
            },
          },
        }),
        defineUniModule({
          name: 'account',
          dependsOn: ['base'],
          middlewares: [
            {
              name: 'auth',
              handler() {
                return undefined
              },
            },
          ],
          lifecycle: {
            register() {
              calls.push('register:account')
            },
            init() {
              calls.push('init:account')
            },
            boot() {
              calls.push('boot:account')
            },
          },
        }),
      ],
    }))
    app.pinia = pinia

    await app.ready

    expect(app.config.apiBaseURL).toBe('https://api.example.com')
    expect(app.config.request?.timeout).toBe(2500)
    expect(app.middlewares.list()).toContain('auth')
    expect(await app.hooks.collect<string>('demo.collect', 'payload')).toEqual(['payload-handled'])

    app.events.emit('session:changed', 'ok')

    expect(calls).toEqual([
      'register:base',
      'register:account',
      'init:base',
      'init:account',
      'boot:base',
      'boot:account',
      'hook:payload',
      'event:ok',
    ])
  })

  it('creates named socket managers from config patches', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const app = createUni(defineUniConfig({
      appName: 'named-socket-test',
      storage: createMemoryStorageAdapter(),
      modules: [
        defineUniModule({
          name: 'chat',
          config: {
            sockets: {
              chat: {
                url: 'wss://example.com/chat',
                connectOnLogin: true,
              },
            },
          },
        }),
      ],
    }))
    app.pinia = pinia

    await app.ready

    expect(app.socket.name).toBeUndefined()
    expect(app.sockets.chat).toBeDefined()
    expect(app.sockets.chat.name).toBe('chat')
    expect(app.config.sockets?.chat?.url).toBe('wss://example.com/chat')
  })

  it('bridges named socket events into business events', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const app = createUni(defineUniConfig({
      appName: 'named-socket-bridge-test',
      storage: createMemoryStorageAdapter(),
      modules: [
        defineUniModule({
          name: 'chat',
          ...createSocketBridge({
            manager: 'chat',
            status: 'chat:socket-status',
            messages: {
              'chat.message': 'chat:message',
            },
          }),
        }),
      ],
    }))
    app.pinia = pinia

    await app.ready

    const payloads: unknown[] = []
    const status: unknown[] = []

    app.events.on('chat:message', payload => payloads.push(payload))
    app.events.on('chat:socket-status', payload => status.push(payload))

    app.events.emit('socket:chat:open', {
      url: 'wss://example.com/chat',
    })
    app.events.emit('socket:chat:chat.message', {
      manager: 'chat',
      event: 'chat.message',
      data: {
        id: 'msg-1',
      },
      raw: null,
      receivedAt: Date.now(),
    })

    expect(status).toEqual([
      {
        status: 'open',
        connected: true,
      },
    ])
    expect(payloads).toEqual([
      {
        id: 'msg-1',
      },
    ])
  })
})
