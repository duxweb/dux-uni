import type { UniNavigationAdapter, UniNavigationTarget, UniPageMeta } from '../types'

async function loadUniPromisesNavigation() {
  return await import('@uni-helper/uni-promises')
}

function stringifyQuery(target?: UniNavigationTarget['query']) {
  if (!target) {
    return ''
  }

  return Object.entries(target)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

function buildQuery(target?: UniNavigationTarget['query']) {
  const query = stringifyQuery(target)
  return query ? `?${query}` : ''
}

function looksLikePagePath(target: string) {
  return target.startsWith('/') || target.startsWith('pages/')
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function isModuleIndexPage(page: UniPageMeta, moduleName: string) {
  return page.module === moduleName && normalizePath(page.path) === `/pages/${moduleName}/index`
}

function hasUniRuntime() {
  return typeof uni !== 'undefined'
}

function createDefaultAdapter(): UniNavigationAdapter {
  return {
    async navigateTo(options) {
      if (!hasUniRuntime()) {
        return undefined
      }
      const { navigateTo } = await loadUniPromisesNavigation()
      return await navigateTo(options as any)
    },
    async redirectTo(options) {
      if (!hasUniRuntime()) {
        return undefined
      }
      const { redirectTo } = await loadUniPromisesNavigation()
      return await redirectTo(options as any)
    },
    async switchTab(options) {
      if (!hasUniRuntime()) {
        return undefined
      }
      const { switchTab } = await loadUniPromisesNavigation()
      return await switchTab(options as any)
    },
    async reLaunch(options) {
      if (!hasUniRuntime()) {
        return undefined
      }
      const { reLaunch } = await loadUniPromisesNavigation()
      return await reLaunch(options as any)
    },
    async navigateBack(options) {
      if (!hasUniRuntime()) {
        return undefined
      }
      const { navigateBack } = await loadUniPromisesNavigation()
      return await navigateBack(options as any)
    },
    async setNavigationBarTitle(options) {
      if (!hasUniRuntime() || typeof uni.setNavigationBarTitle !== 'function') {
        return undefined
      }
      return await new Promise((resolve, reject) => {
        uni.setNavigationBarTitle({
          title: options.title,
          success: resolve,
          fail: reject,
        })
      })
    },
  }
}

export function createNavigator(options?: {
  pages?: UniPageMeta[]
  adapter?: UniNavigationAdapter
}) {
  const pageList = options?.pages || []
  const pages = new Map<string, UniPageMeta>(pageList.map(page => [page.name, page]))
  const adapter = options?.adapter || createDefaultAdapter()

  function resolve(target: UniNavigationTarget | string) {
    if (typeof target === 'string') {
      if (looksLikePagePath(target)) {
        return target
      }

      const page = pages.get(target)
      if (page) {
        return page.path
      }

      const moduleIndexPage = pageList.find(page => isModuleIndexPage(page, target))
      if (moduleIndexPage) {
        return moduleIndexPage.path
      }

      return target
    }

    if (target.path) {
      return `${target.path}${buildQuery(target.query)}`
    }

    if (!target.name) {
      throw new Error('Navigation target requires a path or name')
    }

    const page = pages.get(target.name)
    if (!page) {
      throw new Error(`Unknown page "${target.name}"`)
    }
    return `${page.path}${buildQuery(target.query)}`
  }

  return {
    resolve,
    push(target: UniNavigationTarget | string) {
      return adapter.navigateTo({ url: resolve(target) })
    },
    replace(target: UniNavigationTarget | string) {
      return adapter.redirectTo({ url: resolve(target) })
    },
    switchTab(target: UniNavigationTarget | string) {
      return adapter.switchTab({ url: resolve(target) })
    },
    reLaunch(target: UniNavigationTarget | string) {
      return adapter.reLaunch({ url: resolve(target) })
    },
    back(delta = 1) {
      return adapter.navigateBack({ delta })
    },
    setTitle(title: string) {
      return adapter.setNavigationBarTitle?.({ title }) || Promise.resolve(undefined)
    },
  }
}
