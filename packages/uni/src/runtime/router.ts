import type { UniNavigationTarget, UniPageMeta } from '../types'

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function stripQuery(path: string) {
  return normalizePath(path).split('?')[0]
}

function inferModuleName(page: UniPageMeta) {
  if (typeof page.module === 'string' && page.module) {
    return page.module
  }
  const segments = stripQuery(page.path).split('/').filter(Boolean)
  if (segments[0] === 'pages' && segments[1]) {
    return segments[1]
  }
  return 'app'
}

export function createRouter(options: {
  pages: UniPageMeta[]
  navigator: ReturnType<typeof import('./navigator').createNavigator>
}) {
  const pages = options.pages.map(page => ({
    ...page,
    path: normalizePath(page.path),
    module: inferModuleName(page),
  }))

  const pageByName = new Map<string, UniPageMeta>()
  const pageByPath = new Map<string, UniPageMeta>()
  const pagesByModule = new Map<string, UniPageMeta[]>()

  pages.forEach((page) => {
    pageByPath.set(stripQuery(page.path), page)
    if (page.name) {
      pageByName.set(page.name, page)
    }
    const moduleName = inferModuleName(page)
    const list = pagesByModule.get(moduleName) || []
    list.push(page)
    pagesByModule.set(moduleName, list)
  })

  function getPageByTarget(target: UniNavigationTarget | string) {
    if (typeof target === 'string') {
      return pageByPath.get(stripQuery(target)) || pageByName.get(target)
    }
    if (target.path) {
      return pageByPath.get(stripQuery(target.path))
    }
    if (target.name) {
      return pageByName.get(target.name)
    }
    return undefined
  }

  return {
    pages,
    list() {
      return [...pages]
    },
    getPageByName(name: string) {
      return pageByName.get(name)
    },
    getPageByPath(path: string) {
      return pageByPath.get(stripQuery(path))
    },
    getPagesByModule(moduleName: string) {
      return [...(pagesByModule.get(moduleName) || [])]
    },
    resolve(target: UniNavigationTarget | string) {
      return options.navigator.resolve(target)
    },
    getPageByTarget,
    push(target: UniNavigationTarget | string) {
      return options.navigator.push(target)
    },
    replace(target: UniNavigationTarget | string) {
      return options.navigator.replace(target)
    },
    switchTab(target: UniNavigationTarget | string) {
      return options.navigator.switchTab(target)
    },
    reLaunch(target: UniNavigationTarget | string) {
      return options.navigator.reLaunch(target)
    },
    back(delta?: number) {
      return options.navigator.back(delta)
    },
  }
}
