import type { DuxConfig, DuxPageMeta, DuxRouterManifest } from './types.ts'
import { defaultRadiusTokens, defaultSpacingTokens, resolveThemeTokens } from './theme.ts'

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function normalizeRouteRef(value: string) {
  if (!value) {
    return ''
  }
  return value.startsWith('pages/') || value.startsWith('/pages/')
    ? normalizePath(value)
    : value
}

function isModuleIndexPage(page: DuxPageMeta) {
  const path = normalizePath(page.path)
  const moduleName = String(page.module || '')
  return !!moduleName && path === `/pages/${moduleName}/index`
}

function resolvePageRef(pages: DuxPageMeta[], ref: string) {
  const normalizedRef = normalizeRouteRef(ref)

  const matchedByName = pages.find(page => page.name === normalizedRef)
  if (matchedByName) {
    return matchedByName
  }

  const matchedByPath = pages.find(page => normalizePath(page.path) === normalizedRef)
  if (matchedByPath) {
    return matchedByPath
  }

  return pages.find(page => page.module === normalizedRef && isModuleIndexPage(page))
}

export function getDuxPageByRef(pages: DuxPageMeta[], ref: string) {
  return resolvePageRef(pages, ref)
}

function deriveModuleFromPath(path: string) {
  const segments = normalizePath(path).split('/').filter(Boolean)
  if (segments[0] === 'pages' && segments[1]) {
    return segments[1]
  }
  return 'app'
}

function uniquePages(pages: DuxPageMeta[]) {
  const pageMap = new Map<string, DuxPageMeta>()
  pages.forEach((page) => {
    pageMap.set(normalizePath(page.path), {
      ...page,
      path: normalizePath(page.path),
    })
  })
  return [...pageMap.values()]
}

function normalizePageMiddleware(page: DuxPageMeta) {
  const middlewares = Array.isArray(page.middleware)
    ? [...page.middleware]
    : []

  if (page.auth && !middlewares.includes('auth')) {
    middlewares.unshift('auth')
  }

  return middlewares.length ? middlewares : undefined
}

function normalizePageTabBar(page: DuxPageMeta, mode: 'auto' | 'custom' | 'native') {
  if (!page.tabBar) {
    return undefined
  }

  const resolvedMode = mode === 'auto' ? 'custom' : mode

  if (typeof page.tabBar === 'object') {
    return {
      ...page.tabBar,
      mode: typeof page.tabBar.mode === 'string' ? page.tabBar.mode : resolvedMode,
    }
  }

  return {
    mode: resolvedMode,
  }
}

function resolveUi(config: DuxConfig) {
  const schemaComponents = (config.ui?.schemaComponents || []).map((item) => {
    if (typeof item === 'string') {
      return {
        name: item,
        slots: [],
      }
    }

    return {
      name: item.name,
      slots: [...new Set(item.slots || [])],
    }
  })

  return {
    library: config.ui?.library || 'wot',
    theme: config.ui?.theme || 'light',
    darkmode: config.ui?.darkmode ?? false,
    navigationStyle: config.ui?.navigationStyle || 'default',
    schemaComponents,
    tokens: resolveThemeTokens(config.ui?.tokens || {}),
    radius: {
      ...defaultRadiusTokens,
      ...(config.ui?.radius || {}),
    },
    spacing: {
      ...defaultSpacingTokens,
      ...(config.ui?.spacing || {}),
    },
  }
}

export function createDuxRouterManifestFromPages(rawPages: Array<Record<string, unknown>>, config: DuxConfig): DuxRouterManifest {
  const rawNormalizedPages = uniquePages([
    ...rawPages,
    ...((config.extraPages || []) as DuxPageMeta[]),
  ].map((page) => {
    const normalizedPath = normalizePath(String(page.path || ''))
    const name = String(page.name || normalizedPath)
    return {
      ...page,
      path: normalizedPath,
      module: typeof page.module === 'string' && page.module ? page.module : deriveModuleFromPath(normalizedPath),
      name,
    } as DuxPageMeta
  }))

  const resolvedTabBarPages = config.router.tabBar
    .map(ref => resolvePageRef(rawNormalizedPages, ref))
    .filter(Boolean) as DuxPageMeta[]
  const homePage = resolvePageRef(rawNormalizedPages, config.router.home)
  const loginPage = resolvePageRef(rawNormalizedPages, config.router.login)
  const tabBarPathSet = new Set(resolvedTabBarPages.map(page => normalizePath(page.path)))

  const pages = rawNormalizedPages.map((page) => {
    return {
      ...page,
      middleware: normalizePageMiddleware(page),
      tabBar: tabBarPathSet.has(normalizePath(page.path))
        ? normalizePageTabBar(page, config.router.tabBarMode || 'custom')
        : undefined,
    }
  })

  const pagesByName = pages.reduce<Record<string, DuxPageMeta>>((output, page) => {
    output[page.name] = page
    return output
  }, {})

  const pagesByModule = pages.reduce<Record<string, DuxPageMeta[]>>((output, page) => {
    const moduleName = String(page.module || 'app')
    output[moduleName] = output[moduleName] || []
    output[moduleName].push(page)
    return output
  }, {})

  const tabBarPages = resolvedTabBarPages

  return {
    config: {
      ...config,
      router: {
        ...config.router,
        tabBarMode: config.router.tabBarMode || 'auto',
      },
      ui: resolveUi(config),
    },
    pages,
    pagesByName,
    pagesByModule,
    homePage,
    loginPage,
    tabBarPages,
  }
}
