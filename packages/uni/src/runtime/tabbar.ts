import type { UniAppContext, UniAppConfig, UniNavigationTarget, UniPageMeta, UniTabBarMode, UniTabBarRenderer } from '../types'

function resolveTabBarMeta(page?: UniPageMeta) {
  return page?.tabBar && typeof page.tabBar === 'object'
    ? page.tabBar as Record<string, unknown>
    : undefined
}

export function resolveTabBarMode(
  config: Pick<UniAppConfig, 'tabBarMode' | 'tabBarRenderer'>,
  page?: UniPageMeta,
): Exclude<UniTabBarMode, 'auto'> | undefined {
  const meta = resolveTabBarMeta(page)
  const rawMode = typeof meta?.mode === 'string'
    ? meta.mode
    : page?.tabBar
      ? config.tabBarMode
      : config.tabBarMode || 'auto'

  if (rawMode === 'native' || rawMode === 'custom') {
    return rawMode
  }

  return 'native'
}

export function resolveTabBarRenderer(
  config: Pick<UniAppConfig, 'tabBarMode' | 'tabBarRenderer'>,
  page?: UniPageMeta,
): Exclude<UniTabBarRenderer, 'auto'> | undefined {
  const meta = resolveTabBarMeta(page)
  const rawRenderer = typeof meta?.renderer === 'string'
    ? meta.renderer
    : page?.tabBar
      ? config.tabBarRenderer
      : config.tabBarRenderer || 'auto'

  if (rawRenderer === 'native' || rawRenderer === 'custom') {
    return rawRenderer
  }

  return resolveTabBarMode(config, page) === 'native' ? 'native' : 'custom'
}

export function shouldUseNativeTabBar(
  config: Pick<UniAppConfig, 'tabBarMode' | 'tabBarRenderer'>,
  page?: UniPageMeta,
) {
  return resolveTabBarMode(config, page) === 'native'
}

export function shouldRenderCustomTabBar(
  config: Pick<UniAppConfig, 'tabBarMode' | 'tabBarRenderer'>,
  page?: UniPageMeta,
) {
  return resolveTabBarRenderer(config, page) === 'custom'
}

export async function navigateWithTabBarSupport(
  app: Pick<UniAppContext, 'config' | 'router'>,
  target: UniNavigationTarget | string,
) {
  const resolved = app.router.resolve(target)
  const page = app.router.getPageByPath(resolved) || app.router.getPageByTarget(target)

  const result = page?.tabBar
    ? resolveTabBarMode(app.config, page) === 'native'
      ? await app.router.switchTab(target)
      : await app.router.reLaunch(target)
    : await app.router.push(target)

  syncNativeTabBarVisibility(app.config)
  return result
}

export function syncNativeTabBarVisibility(config: Pick<UniAppConfig, 'tabBarMode' | 'tabBarRenderer'>) {
  if (config.tabBarMode !== 'native' || config.tabBarRenderer !== 'custom') {
    return
  }

  const hideTabBar = (uni as typeof uni & {
    hideTabBar?: (options?: {
      animation?: boolean
      success?: () => void
      fail?: () => void
    }) => void
  }).hideTabBar

  if (typeof hideTabBar !== 'function') {
    return
  }

  const run = () => {
    hideTabBar({
      animation: false,
      fail: () => {},
    })
  }

  run()
  setTimeout(run, 0)
  setTimeout(run, 32)
}

export function installNativeTabBarRuntime(
  app: {
    mixin?: (input: Record<string, unknown>) => unknown
  },
  config: Pick<UniAppConfig, 'tabBarMode' | 'tabBarRenderer'>,
) {
  if (config.tabBarMode !== 'native' || config.tabBarRenderer !== 'custom') {
    return
  }

  syncNativeTabBarVisibility(config)

  app.mixin?.({
    onShow() {
      syncNativeTabBarVisibility(config)
    },
    onReady() {
      syncNativeTabBarVisibility(config)
    },
  })
}
