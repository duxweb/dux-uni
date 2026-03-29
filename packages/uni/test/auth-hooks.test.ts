import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  createMemoryStorageAdapter,
  createUni,
  defineUniConfig,
  getQueryKey,
  useAuthStore,
  useCan,
  useCheck,
  useIsLogin,
  useLogin,
  useLogout,
} from '../src'

describe('auth hooks', () => {
  it('syncs session, pinia, query cache, and navigation', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const redirects: string[] = []
    const app = createUni(defineUniConfig({
      appName: 'auth-test',
      storage: createMemoryStorageAdapter(),
      navigator: {
        async navigateTo() {},
        async redirectTo() {},
        async switchTab() {},
        async reLaunch(options) {
          redirects.push(options.url)
        },
        async navigateBack() {},
      },
      authProvider: {
        async login() {
          return {
            success: true,
            redirectTo: '/pages/index',
            data: {
              token: 'token-1',
              user: { id: 1 },
              permissions: ['post.view'],
            },
          }
        },
        async logout() {
          return {
            success: true,
            redirectTo: '/pages/login',
          }
        },
        async check(_params, _context, auth) {
          return {
            success: true,
            data: {
              ...auth,
              token: 'token-2',
            },
          }
        },
        can(permission, _context, auth) {
          return Array.isArray(auth?.permissions) ? auth.permissions.includes(permission) : true
        },
      },
    }))
    app.pinia = pinia

    const key = getQueryKey(app, {
      scope: 'list',
      path: 'posts',
    })
    app.queryClient.setQueryData(key, {
      data: [{ id: 1 }],
    })

    const scope = effectScope()
    const hooks = scope.run(() => ({
      login: useLogin(app),
      logout: useLogout(app),
      check: useCheck(app),
      can: useCan(app, 'post.view'),
      isLogin: useIsLogin(app),
    }))!

    await hooks.login.login({
      username: 'demo',
      password: 'secret',
    })

    expect(app.session.getAuth()?.token).toBe('token-1')
    expect(useAuthStore(pinia).isAuthenticated).toBe(true)
    expect(hooks.isLogin.value).toBe(true)
    expect(hooks.can.value).toBe(true)
    expect(app.queryClient.getQueryData(key)).toBeUndefined()
    expect(redirects[redirects.length - 1]).toBe('/pages/index')

    await hooks.check.check({})
    expect(app.session.getAuth()?.token).toBe('token-2')

    app.queryClient.setQueryData(key, {
      data: [{ id: 2 }],
    })

    await hooks.logout.logout({})

    expect(app.session.getAuth()).toBeNull()
    expect(useAuthStore(pinia).isAuthenticated).toBe(false)
    expect(hooks.isLogin.value).toBe(false)
    expect(app.queryClient.getQueryData(key)).toBeUndefined()
    expect(redirects[redirects.length - 1]).toBe('/pages/login')

    scope.stop()
  })

  it('passes request overrides from auth hooks into authProvider', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const calls: Array<{ action: string, path?: string, method?: string }> = []
    const app = createUni(defineUniConfig({
      appName: 'auth-override-test',
      storage: createMemoryStorageAdapter(),
      navigator: {
        async navigateTo() {},
        async redirectTo() {},
        async switchTab() {},
        async reLaunch() {},
        async navigateBack() {},
      },
      authProvider: {
        async login(_params, _context, request) {
          calls.push({
            action: 'login',
            path: request?.path,
            method: request?.method,
          })
          return {
            success: true,
            data: {
              token: 'token-override',
            },
          }
        },
        async logout(_params, _context, request) {
          calls.push({
            action: 'logout',
            path: request?.path,
            method: request?.method,
          })
          return {
            success: true,
          }
        },
        async check(_params, _context, auth, request) {
          calls.push({
            action: 'check',
            path: request?.path,
            method: request?.method,
          })
          return {
            success: true,
            data: auth || undefined,
          }
        },
      },
    }))
    app.pinia = pinia

    const scope = effectScope()
    const hooks = scope.run(() => ({
      login: useLogin(app, {
        path: '/passport/login-by-phone',
        method: 'PUT',
      }),
      logout: useLogout(app, {
        path: '/passport/logout',
        method: 'DELETE',
      }),
      check: useCheck(app, {
        path: '/passport/check',
        method: 'POST',
      }),
    }))!

    await hooks.login.login({
      phone: '13800000000',
    })
    await hooks.check.check({
      scene: 'launch',
    })
    await hooks.logout.logout({})

    expect(calls).toEqual([
      { action: 'login', path: '/passport/login-by-phone', method: 'PUT' },
      { action: 'check', path: '/passport/check', method: 'POST' },
      { action: 'logout', path: '/passport/logout', method: 'DELETE' },
    ])

    scope.stop()
  })
})
