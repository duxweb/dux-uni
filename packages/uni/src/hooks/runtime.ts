import type { UniActionContext, UniAppContext, UniCurrentRoute } from '../types'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onMounted, reactive } from 'vue'
import { useDux } from '../app/install'
import { getRuntimeStores, syncRuntimeStores } from '../runtime/state'
import { navigateWithTabBarSupport } from '../runtime/tabbar'

function resolveLoginPath(app: UniAppContext) {
  return app.router.getPageByName('login')?.path
    || app.router.getPageByPath('/pages/auth/login')?.path
    || '/pages/auth/login'
}

function resolveHomePath(app: UniAppContext) {
  return app.router.getPageByName('index')?.path
    || app.router.getPageByPath('/pages/home/index')?.path
    || app.router.getPagesByModule('home').find(page => page.path === '/pages/home/index')?.path
    || app.router.pages[0]?.path
    || '/pages/home/index'
}

function normalizePath(path = '') {
  if (!path) {
    return ''
  }
  return path.startsWith('/') ? path : `/${path}`
}

function stringifyQuery(query: Record<string, string> = {}) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

function createFullPath(path: string, query: Record<string, string> = {}) {
  const search = stringifyQuery(query)
  return search ? `${path}?${search}` : path
}

function resolveCurrentPageMeta(app: UniAppContext) {
  const stack = getCurrentPages()
  const current = stack[stack.length - 1] as { route?: string } | undefined
  const path = normalizePath(current?.route || '')
  return path ? app.router.getPageByPath(path) : undefined
}

function resolveCurrentRoute(app: UniAppContext): UniCurrentRoute {
  const stack = getCurrentPages()
  const current = stack[stack.length - 1] as { route?: string, options?: Record<string, string>, $page?: { fullPath?: string } } | undefined
  const path = normalizePath(current?.route || '')
  const query = current?.options || {}
  const meta = resolveCurrentPageMeta(app)

  return {
    path,
    fullPath: current?.$page?.fullPath || createFullPath(path, query),
    name: meta?.name,
    module: meta?.module,
    query,
    meta,
    tabBar: Boolean(meta?.tabBar),
  }
}

export function useRouter(app?: UniAppContext) {
  const runtime = app || useDux()
  const navigator = runtime.navigator
  const router = runtime.router

  function resolveModulePath(moduleName: string) {
    return router.getPagesByModule(moduleName).find(page => page.path === `/pages/${moduleName}/index`)?.path
      || router.getPagesByModule(moduleName)[0]?.path
  }

  function to(target: Parameters<typeof navigator.push>[0]) {
    return navigateWithTabBarSupport(runtime, target)
  }

  return {
    ...navigator,
    to,
    module(moduleName: string) {
      const path = resolveModulePath(moduleName)
      if (!path) {
        throw new Error(`Unknown module "${moduleName}"`)
      }
      return to(path)
    },
    home() {
      return navigator.reLaunch(resolveHomePath(runtime))
    },
    login() {
      return navigator.reLaunch(resolveLoginPath(runtime))
    },
  }
}

/**
 * @deprecated Prefer `useRouter()`.
 */
export function useNavigator(app?: UniAppContext) {
  return useRouter(app)
}

export function useRoute(app?: UniAppContext) {
  const runtime = app || useDux()
  const route = reactive<UniCurrentRoute>(resolveCurrentRoute(runtime))

  function sync() {
    Object.assign(route, resolveCurrentRoute(runtime))
  }

  onMounted(sync)
  onLoad(sync)
  onShow(sync)

  return route
}

export function useSession(app?: UniAppContext) {
  return (app || useDux()).session
}

function resolveSocketManagerInput(
  nameOrApp?: string | UniAppContext,
  maybeApp?: UniAppContext,
) {
  if (typeof nameOrApp === 'string') {
    return {
      name: nameOrApp,
      app: maybeApp,
    }
  }

  return {
    name: undefined,
    app: nameOrApp,
  }
}

export function useSocketManager(name?: string, app?: UniAppContext): ReturnType<typeof useDux>['socket']
export function useSocketManager(app?: UniAppContext): ReturnType<typeof useDux>['socket']
export function useSocketManager(nameOrApp?: string | UniAppContext, maybeApp?: UniAppContext) {
  const { name, app } = resolveSocketManagerInput(nameOrApp, maybeApp)
  const runtime = app || useDux()
  if (!name) {
    return runtime.socket
  }

  const manager = runtime.sockets[name]
  if (!manager) {
    throw new Error(`Unknown socket manager "${name}"`)
  }
  return manager
}

export function useSocketManagers(app?: UniAppContext) {
  const runtime = app || useDux()
  return {
    default: runtime.socket,
    ...runtime.sockets,
  }
}

export function useWebSocketManager(name?: string, app?: UniAppContext): ReturnType<typeof useDux>['socket']
export function useWebSocketManager(app?: UniAppContext): ReturnType<typeof useDux>['socket']
export function useWebSocketManager(nameOrApp?: string | UniAppContext, maybeApp?: UniAppContext) {
  const { name, app } = resolveSocketManagerInput(nameOrApp, maybeApp)
  return name ? useSocketManager(name, app) : useSocketManager(app)
}

export function useHooks(app?: UniAppContext) {
  return (app || useDux()).hooks
}

export function useEvents(app?: UniAppContext) {
  return (app || useDux()).events
}

export function useActions(app?: UniAppContext) {
  const runtime = app || useDux()
  return {
    ...runtime.actions,
    execute(name: string, payload?: unknown, context?: Omit<UniActionContext, 'app' | 'payload'>) {
      return runtime.actions.execute(name, {
        app: runtime,
        payload,
        ...(context || {}),
      })
    },
  }
}

export function useAction(name: string, app?: UniAppContext) {
  const runtime = app || useDux()

  return {
    execute(payload?: unknown, context?: Omit<UniActionContext, 'app' | 'payload'>) {
      return runtime.actions.execute(name, {
        app: runtime,
        payload,
        ...(context || {}),
      })
    },
  }
}

export function useModules(app?: UniAppContext) {
  const runtime = app || useDux()
  return computed(() => runtime.modules)
}

export function useAuth(app?: UniAppContext) {
  const runtime = app || useDux()
  syncRuntimeStores(runtime)
  const stores = getRuntimeStores(runtime)
  return computed(() => stores?.authStore.auth ?? runtime.session.getAuth())
}
