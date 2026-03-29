import type {
  Dict,
  UniAppContext,
  UniAuthState,
  UniCustomOptions,
  UniDataProvider,
  UniDataResult,
  UniGetManyOptions,
  UniGetOneOptions,
  UniListOptions,
  UniMutateOptions,
} from '../types'

export interface SimpleDataProviderOptions {
  apiUrl?: string
  success?: <T = unknown>(result: UniDataResult<T>) => UniDataResult<T>
  getTotal?: (result: UniDataResult) => number
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

function createApiUrl(prefix?: string, path?: string, basePath?: string) {
  const segments = [prefix, basePath, path]
    .filter(Boolean)
    .map(item => trimSlashes(String(item)))
    .filter(Boolean)

  if (segments.length === 0) {
    return '/'
  }
  return `/${segments.join('/')}`
}

function mergeParams(options: {
  filters?: Dict
  sorters?: Dict
  pagination?: boolean | { page?: number; pageSize?: number }
  query?: Dict
}) {
  const params: Dict = {
    ...(options.query || {}),
    ...(options.filters || {}),
    ...(options.sorters || {}),
  }

  if (typeof options.pagination === 'object') {
    params.page = options.pagination.page
    params.pageSize = options.pagination.pageSize
  }

  return params
}

function withAuthorization(headers: Dict<string> | undefined, auth: UniAuthState | null) {
  if (!auth?.token) {
    return headers
  }
  return {
    ...(headers || {}),
    Authorization: auth.token,
  }
}

async function request<T>(
  context: UniAppContext,
  auth: UniAuthState | null,
  options: {
    method?: string
    path?: string
    id?: string | number
    query?: Dict
    data?: unknown
    headers?: Dict<string>
    meta?: Dict
  },
) {
  const url = options.id ? `${options.path}/${options.id}` : options.path || ''
  const response = await context.request.request<T>({
    url,
    method: options.method,
    query: options.query,
    data: options.data,
    headers: withAuthorization(options.headers, auth),
    meta: options.meta,
  })
  const payload = response.data as any
  const hasEnvelope = payload && typeof payload === 'object' && ('data' in payload || 'meta' in payload || 'message' in payload)

  return {
    message: hasEnvelope ? payload.message : undefined,
    data: hasEnvelope ? payload.data : response.data,
    meta: hasEnvelope ? payload.meta : undefined,
    status: response.status,
    headers: response.headers,
    raw: response.raw,
  } satisfies UniDataResult<T>
}

export function simpleDataProvider(options?: SimpleDataProviderOptions): UniDataProvider {
  const finalize = <T>(result: UniDataResult<T>) => {
    if (options?.success) {
      return options.success(result)
    }
    return result
  }

  const provider: UniDataProvider = {
    apiUrl(path, basePath) {
      return createApiUrl(options?.apiUrl, path, basePath)
    },
    async getList(input: UniListOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        query: mergeParams(input),
        meta: input.meta,
      }))
    },
    async getOne(input: UniGetOneOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        id: input.id,
        meta: input.meta,
      }))
    },
    async getMany(input: UniGetManyOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        query: { ids: input.ids },
        meta: input.meta,
      }))
    },
    async create(input: UniMutateOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        method: 'POST',
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        data: input.data,
        meta: input.meta,
      }))
    },
    async update(input: UniMutateOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        method: 'PUT',
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        id: input.id,
        data: input.data,
        meta: input.meta,
      }))
    },
    async deleteOne(input: UniMutateOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        method: 'DELETE',
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        id: input.id,
        meta: input.meta,
      }))
    },
    async custom(input: UniCustomOptions, context: UniAppContext, auth: UniAuthState | null) {
      return finalize(await request(context, auth, {
        method: input.method,
        path: provider.apiUrl?.(input.path, context.config.apiBasePath),
        query: mergeParams({
          query: input.query,
          filters: input.filters,
          sorters: input.sorters,
        }),
        data: input.payload,
        headers: input.headers,
        meta: input.meta,
      }))
    },
    getTotal(result) {
      if (options?.getTotal) {
        return options.getTotal(result)
      }

      const meta = result.meta || {}
      if (typeof meta.total === 'number') {
        return meta.total
      }

      const data = result.data
      if (Array.isArray(data)) {
        return data.length
      }

      return 0
    },
  }

  return provider
}
