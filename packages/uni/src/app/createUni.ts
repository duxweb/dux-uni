import type { UniAppConfig, UniAppContext, UniRequestError, UniStores } from '../types'
import { simpleAuthProvider } from '../providers/auth'
import { simpleDataProvider } from '../providers/data'
import { mergeUniModules } from '../module/merge'
import { createActionRegistry } from '../runtime/action'
import { createEventBus } from '../runtime/events'
import { createHookRegistry } from '../runtime/hooks'
import { createMiddlewareRegistry } from '../runtime/middleware'
import { createModuleRuntime } from '../runtime/module'
import { createNavigator } from '../runtime/navigator'
import { createOverlayRuntime } from '../runtime/overlay'
import { createUniQueryClient } from '../runtime/query'
import { createRequestClient } from '../runtime/request'
import { createRouter } from '../runtime/router'
import { createSessionManager } from '../runtime/session'
import { createSocketManager } from '../runtime/socket'
import { syncRuntimeStores } from '../runtime/state'
import { navigateWithTabBarSupport } from '../runtime/tabbar'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useSchemaStore } from '../stores/schema'
import { useSessionStore } from '../stores/session'

function resolveHomePath(app: UniAppContext) {
  return app.router.getPageByName('index')?.path
    || app.router.getPageByPath('/pages/home/index')?.path
    || app.router.getPagesByModule('home').find(page => page.path === '/pages/home/index')?.path
    || app.router.pages[0]?.path
    || '/pages/home/index'
}

export function createUni(config: UniAppConfig): UniAppContext {
  const baseConfig = mergeUniModules(config)
  const hooks = createHookRegistry()
  const events = createEventBus()
  const middlewares = createMiddlewareRegistry()
  const actions = createActionRegistry()
  const moduleRuntime = createModuleRuntime({
    config: baseConfig,
    modules: baseConfig.modules || [],
    actions,
    hooks,
    events,
    middlewares,
  })

  moduleRuntime.register()
  const mergedConfig = moduleRuntime.resolveConfig(baseConfig)
  const modules = moduleRuntime.modules
  const pages = mergedConfig.pages || []

  const session = createSessionManager({
    storage: mergedConfig.storage,
    storageKey: mergedConfig.storageKey,
  })
  session.hydrateSync()
  const queryClient = createUniQueryClient(mergedConfig.query)

  const authStore = useAuthStore
  const sessionStore = useSessionStore
  const appStore = useAppStore
  const schemaStore = useSchemaStore

  const stores: UniStores = {
    auth: authStore,
    app: appStore,
    session: sessionStore,
    schema: schemaStore,
  }

  const navigator = createNavigator({
    pages,
    adapter: mergedConfig.navigator,
  })
  const router = createRouter({
    pages,
    navigator,
  })
  const overlay = createOverlayRuntime(() => app)
  const socket = createSocketManager(() => app, {
    getConfig: currentApp => currentApp.config.socket,
  })
  const sockets = Object.fromEntries(
    Object.keys(mergedConfig.sockets || {}).map(name => [
      name,
      createSocketManager(() => app, {
        name,
        eventPrefix: `socket:${name}`,
        getConfig: currentApp => currentApp.config.sockets?.[name],
      }),
    ]),
  )

  function resolveForbiddenPath() {
    return mergedConfig.permission?.redirectTo
      || router.getPageByName('system.forbidden')?.path
      || router.getPageByPath('/pages/system/forbidden')?.path
      || router.getPageByPath('/pages/system/forbidden/index')?.path
      || router.getPageByPath('/pages/forbidden/index')?.path
      || resolveHomePath(app)
  }

  async function navigateByTarget(app: UniAppContext, target: Parameters<typeof navigator.push>[0]) {
    return await navigateWithTabBarSupport(app, target)
  }

  actions.register('navigate', async ({ app, payload }) => {
      if (typeof payload === 'string') {
        return await navigateByTarget(app, payload)
      }
      if (payload && typeof payload === 'object') {
        return await navigateByTarget(app, payload as any)
      }
      throw new Error('Navigate action requires a string or navigation target payload')
  })

  let app: UniAppContext

  const request = createRequestClient({
    baseURL: mergedConfig.apiBaseURL,
    ...mergedConfig.request,
    getHeaders: () => {
      const auth = session.getAuth()
      if (!auth?.token) {
        return mergedConfig.request?.getHeaders?.()
      }
      return {
        ...(mergedConfig.request?.getHeaders?.() || {}),
        Authorization: auth.token,
      }
    },
    onError: [
      ...(mergedConfig.request?.onError || []),
      async (error: UniRequestError) => {
        const provider = mergedConfig.authProvider || simpleAuthProvider()
        const result = await provider.onError?.(error, app)
        if (!result?.logout) {
          throw error
        }
        await session.clear()
        await queryClient.removeQueries()
        syncRuntimeStores(app)
        if (result.redirectTo) {
          await router.reLaunch(result.redirectTo)
        }
        throw error
      },
    ],
  })

  const ready = Promise.resolve().then(async () => {
    await moduleRuntime.run('init', app)
    await session.initialize()
    syncRuntimeStores(app)
    await moduleRuntime.run('boot', app)
  })

  app = {
    config: {
      ...mergedConfig,
      authProvider: mergedConfig.authProvider || simpleAuthProvider(),
      dataProvider: mergedConfig.dataProvider || simpleDataProvider(),
    },
    pinia: undefined,
    ready,
    modules,
    request,
    queryClient,
    navigator,
    router,
    session,
    actions,
    hooks,
    events,
    middlewares,
    overlay,
    socket,
    sockets,
    stores,
  }

  middlewares.register({
    name: 'permission',
    order: 100,
    handler({ app, to }) {
      const permission = to?.permission
      if (!permission) {
        return
      }

      const provider = app.config.authProvider || simpleAuthProvider()
      const permissions = Array.isArray(permission) ? permission : [permission]
      const allowed = permissions.every(item => provider.can?.(item, app, app.session.getAuth()) ?? true)
      if (allowed) {
        return
      }

      return {
        redirectTo: resolveForbiddenPath(),
      }
    },
  })

  Object.entries(mergedConfig.moduleActions || {}).forEach(([name, handler]) => {
    actions.register(name, handler)
  })

  return app
}
