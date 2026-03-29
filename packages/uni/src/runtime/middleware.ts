import type { Dict, UniModuleMiddleware, UniModuleMiddlewareContext, UniModuleMiddlewareResult, UniPageMeta } from '../types'

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function matches(page: UniPageMeta | undefined, matcher: UniModuleMiddleware['matcher']) {
  if (!matcher) {
    return true
  }
  if (typeof matcher === 'function') {
    return matcher(page)
  }
  if (!page?.path) {
    return false
  }
  const currentPath = normalizePath(page.path)
  const candidates = Array.isArray(matcher) ? matcher : [matcher]
  return candidates.some(item => normalizePath(item) === currentPath)
}

function uniqueNames(page: UniPageMeta | undefined) {
  const names = new Set<string>(page?.middleware || [])
  if (page?.auth) {
    names.add('auth')
  }
  if ((page as Dict | undefined)?.guestOnly) {
    names.add('guest')
  }
  if (page?.permission) {
    names.add('permission')
  }
  return [...names]
}

export function createMiddlewareRegistry() {
  const store = new Map<string, UniModuleMiddleware[]>()

  const resolve = (page?: UniPageMeta) => {
    return uniqueNames(page).flatMap((name) => {
      return (store.get(name) || []).filter(item => matches(page, item.matcher))
    })
  }

  return {
    register(input: UniModuleMiddleware) {
      const current = store.get(input.name) || []
      current.push(input)
      current.sort((a, b) => (a.order || 0) - (b.order || 0))
      store.set(input.name, current)
      return () => {
        const list = store.get(input.name)
        if (!list) {
          return
        }
        store.set(input.name, list.filter(item => item !== input))
      }
    },
    unregister(name: string) {
      store.delete(name)
    },
    resolve,
    async run(context: UniModuleMiddlewareContext) {
      const handlers = resolve(context.to)
      for (const middleware of handlers) {
        const result = await middleware.handler(context)
        if (result !== undefined) {
          return result as UniModuleMiddlewareResult
        }
      }
      return undefined
    },
    list() {
      return [...store.keys()]
    },
  }
}
