import type { Query } from '@tanstack/vue-query'
import type { CreateUniQueryClientOptions, UniAppContext } from '../types'
import { QueryClient } from '@tanstack/vue-query'

const UNI_QUERY_NAMESPACE = '@duxweb/uni'

export type UniQueryScope = 'custom' | 'infinite' | 'list' | 'many' | 'one'

export interface UniQueryDescriptor {
  scope?: UniQueryScope
  path?: string
  id?: string | number | null
  params?: unknown
}

export function createUniQueryClient(options?: CreateUniQueryClientOptions) {
  if (options?.client) {
    return options.client
  }

  const { client: _client, ...config } = options || {}

  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        ...(config.defaultOptions?.queries || {}),
      },
      mutations: {
        ...(config.defaultOptions?.mutations || {}),
      },
    },
    ...config,
  })
}

export function getQueryNamespace(app: UniAppContext) {
  return [UNI_QUERY_NAMESPACE, app.config.appName || 'app'] as const
}

export function getQueryKey(app: UniAppContext, descriptor: UniQueryDescriptor = {}) {
  return [
    ...getQueryNamespace(app),
    descriptor.scope || null,
    descriptor.path || null,
    descriptor.id ?? null,
    descriptor.params ?? null,
  ] as const
}

export function isUniQueryKey(
  app: UniAppContext,
  queryKey: readonly unknown[],
  descriptor: UniQueryDescriptor = {},
) {
  const namespace = getQueryNamespace(app)
  if (queryKey[0] !== namespace[0] || queryKey[1] !== namespace[1]) {
    return false
  }
  if (descriptor.scope != null && queryKey[2] !== descriptor.scope) {
    return false
  }
  if (descriptor.path != null && queryKey[3] !== descriptor.path) {
    return false
  }
  if (descriptor.id != null && queryKey[4] !== descriptor.id) {
    return false
  }
  if (descriptor.params !== undefined && queryKey[5] !== descriptor.params) {
    return false
  }
  return true
}

export function createQueryFilters(app: UniAppContext, descriptor: UniQueryDescriptor = {}) {
  return {
    predicate(query: Query) {
      return isUniQueryKey(app, query.queryKey, descriptor)
    },
  }
}

export async function removeUniQueries(app: UniAppContext, descriptor: UniQueryDescriptor = {}) {
  await app.queryClient.removeQueries(createQueryFilters(app, descriptor))
}
