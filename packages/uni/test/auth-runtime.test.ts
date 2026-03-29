import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMemoryStorageAdapter,
  createUni,
  defineUniConfig,
  runAuthCheckOnLaunch,
  runAuthCheckOnShow,
} from '../src'

describe('auth runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-28T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('auto checks auth on launch and throttles checks on show', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    let currentAuth = {
      token: 'token-1',
      user: { id: 1 },
    }
    let checkCount = 0

    const storage = createMemoryStorageAdapter()
    await storage.set('@duxweb/uni/session', currentAuth)

    const app = createUni(defineUniConfig({
      appName: 'auth-runtime-test',
      storage,
      auth: {
        checkTtl: 5 * 60 * 1000,
      },
      navigator: {
        async navigateTo() {},
        async redirectTo() {},
        async switchTab() {},
        async reLaunch() {},
        async navigateBack() {},
      },
      authProvider: {
        async login() {
          return {
            success: true,
            data: currentAuth,
          }
        },
        async logout() {
          return {
            success: true,
          }
        },
        async check() {
          checkCount += 1
          currentAuth = {
            ...currentAuth,
            token: `token-${checkCount + 1}`,
          }
          return {
            success: true,
            data: currentAuth,
          }
        },
      },
    }))
    app.pinia = pinia

    await runAuthCheckOnLaunch(app)
    expect(checkCount).toBe(1)
    expect(app.session.getAuth()?.token).toBe('token-2')

    await runAuthCheckOnShow(app)
    expect(checkCount).toBe(1)

    vi.setSystemTime(new Date('2026-03-28T10:06:00.000Z'))
    await runAuthCheckOnShow(app)
    expect(checkCount).toBe(2)
    expect(app.session.getAuth()?.token).toBe('token-3')
  })

  it('can disable auto check on launch and show', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const storage = createMemoryStorageAdapter()
    await storage.set('@duxweb/uni/session', {
      token: 'token-1',
    })

    let checkCount = 0
    const app = createUni(defineUniConfig({
      appName: 'auth-runtime-disabled-test',
      storage,
      auth: {
        autoCheckOnLaunch: false,
        autoCheckOnShow: false,
      },
      navigator: {
        async navigateTo() {},
        async redirectTo() {},
        async switchTab() {},
        async reLaunch() {},
        async navigateBack() {},
      },
      authProvider: {
        async login() {
          return {
            success: true,
            data: {
              token: 'token-1',
            },
          }
        },
        async logout() {
          return {
            success: true,
          }
        },
        async check() {
          checkCount += 1
          return {
            success: true,
            data: {
              token: 'token-2',
            },
          }
        },
      },
    }))
    app.pinia = pinia

    await runAuthCheckOnLaunch(app)
    await runAuthCheckOnShow(app)

    expect(checkCount).toBe(0)
    expect(app.session.getAuth()?.token).toBe('token-1')
  })
})
