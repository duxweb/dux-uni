import type { InfiniteData, UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import type {
  Dict,
  UniAppContext,
  UniCustomOptions,
  UniDataResult,
  UniGetManyOptions,
  UniGetOneOptions,
  UniListOptions,
  UniMutateOptions,
  UniRequestError,
} from '../types'
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/vue-query'
import { computed, onMounted, ref, unref, watch } from 'vue'
import { createQueryFilters, getQueryKey } from '../runtime/query'
import type { UniQueryDescriptor, UniQueryScope } from '../runtime/query'
import { getDataProvider, resolveHookAppOptions } from './shared'

type QueryConfig<TResult> = Omit<
  UseQueryOptions<TResult, UniRequestError, TResult, TResult, ReturnType<typeof getQueryKey>>,
  'queryFn' | 'queryKey'
>

type InfiniteQueryConfig<TResult> = Omit<
  UseInfiniteQueryOptions<TResult, UniRequestError, InfiniteData<TResult>, ReturnType<typeof getQueryKey>, number>,
  'getNextPageParam' | 'initialPageParam' | 'queryFn' | 'queryKey'
>

type MutationConfig<TResult, TVariables> = Omit<
  UseMutationOptions<TResult, UniRequestError, TVariables>,
  'mutationFn'
>

type MutationInvalidateOptions =
  | boolean
  | UniQueryDescriptor
  | UniQueryDescriptor[]

const MUTATION_INVALIDATE_SCOPES: UniQueryScope[] = ['custom', 'infinite', 'list', 'many', 'one']

type PaginationInput = boolean | number | { page?: number; pageSize?: number }

function normalizePagination(input: PaginationInput | undefined) {
  if (!input) {
    return {
      enabled: false,
      page: 1,
      pageSize: 20,
    }
  }
  if (typeof input === 'number') {
    return {
      enabled: true,
      page: 1,
      pageSize: input,
    }
  }
  if (input === true) {
    return {
      enabled: true,
      page: 1,
      pageSize: 20,
    }
  }
  return {
    enabled: true,
    page: input.page || 1,
    pageSize: input.pageSize || 20,
  }
}

function buildListInput(options: {
  path?: string
  pagination?: { enabled: boolean; page: number; pageSize: number }
  filters?: Dict
  sorters?: Dict<'asc' | 'desc'>
  meta?: Dict
}): UniListOptions {
  return {
    path: options.path || '',
    pagination: options.pagination?.enabled
      ? {
          page: options.pagination.page,
          pageSize: options.pagination.pageSize,
        }
      : undefined,
    filters: options.filters,
    sorters: options.sorters,
    meta: options.meta,
  }
}

export interface UseListOptions<T = Dict> {
  path?: MaybeRef<string | undefined>
  filters?: MaybeRef<Dict | undefined>
  sorters?: MaybeRef<Dict<'asc' | 'desc'> | undefined>
  pagination?: MaybeRef<PaginationInput | undefined>
  meta?: MaybeRef<Dict | undefined>
  enabled?: MaybeRef<boolean | undefined>
  queryOptions?: QueryConfig<UniDataResult<T[]>>
}

export interface UseInfiniteListOptions<T = Dict> {
  path?: MaybeRef<string | undefined>
  filters?: MaybeRef<Dict | undefined>
  sorters?: MaybeRef<Dict<'asc' | 'desc'> | undefined>
  pagination?: MaybeRef<PaginationInput | undefined>
  meta?: MaybeRef<Dict | undefined>
  enabled?: MaybeRef<boolean | undefined>
  queryOptions?: InfiniteQueryConfig<UniDataResult<T[]>>
}

export interface UseOneOptions<T = Dict> {
  path?: MaybeRef<string | undefined>
  id?: MaybeRef<string | number | undefined>
  meta?: MaybeRef<Dict | undefined>
  enabled?: MaybeRef<boolean | undefined>
  queryOptions?: QueryConfig<UniDataResult<T>>
}

export interface UseManyOptions<T = Dict> {
  path?: MaybeRef<string | undefined>
  ids?: MaybeRef<Array<string | number> | undefined>
  meta?: MaybeRef<Dict | undefined>
  enabled?: MaybeRef<boolean | undefined>
  queryOptions?: QueryConfig<UniDataResult<T[]>>
}

export interface UseCustomOptions<T = unknown> {
  path?: MaybeRef<string | undefined>
  method?: MaybeRef<string | undefined>
  query?: MaybeRef<Dict | undefined>
  filters?: MaybeRef<Dict | undefined>
  sorters?: MaybeRef<Dict<'asc' | 'desc'> | undefined>
  payload?: MaybeRef<unknown>
  headers?: MaybeRef<Dict<string> | undefined>
  meta?: MaybeRef<Dict | undefined>
  enabled?: MaybeRef<boolean | undefined>
  queryOptions?: QueryConfig<UniDataResult<T>>
}

export interface UseCreateOptions<T = unknown> {
  path?: MaybeRef<string | undefined>
  data?: MaybeRef<unknown>
  meta?: MaybeRef<Dict | undefined>
  invalidate?: MutationInvalidateOptions
  mutationOptions?: MutationConfig<UniDataResult<T>, Partial<UniMutateOptions>>
}

export interface UseUpdateOptions<T = unknown> {
  path?: MaybeRef<string | undefined>
  id?: MaybeRef<string | number | undefined>
  data?: MaybeRef<unknown>
  meta?: MaybeRef<Dict | undefined>
  invalidate?: MutationInvalidateOptions
  mutationOptions?: MutationConfig<UniDataResult<T>, Partial<UniMutateOptions>>
}

export interface UseDeleteOptions<T = unknown> {
  path?: MaybeRef<string | undefined>
  id?: MaybeRef<string | number | undefined>
  meta?: MaybeRef<Dict | undefined>
  invalidate?: MutationInvalidateOptions
  mutationOptions?: MutationConfig<UniDataResult<T>, Partial<UniMutateOptions>>
}

export interface UseCustomMutationOptions<T = unknown> {
  path?: MaybeRef<string | undefined>
  method?: MaybeRef<string | undefined>
  query?: MaybeRef<Dict | undefined>
  filters?: MaybeRef<Dict | undefined>
  sorters?: MaybeRef<Dict<'asc' | 'desc'> | undefined>
  payload?: MaybeRef<unknown>
  headers?: MaybeRef<Dict<string> | undefined>
  meta?: MaybeRef<Dict | undefined>
  invalidate?: MutationInvalidateOptions
  mutationOptions?: MutationConfig<UniDataResult<T>, Partial<UniCustomOptions>>
}

function resolveMutationInvalidate(
  path: string | undefined,
  option: MutationInvalidateOptions | undefined,
): UniQueryDescriptor[] {
  if (!option || !path) {
    return []
  }

  if (option === true) {
    return MUTATION_INVALIDATE_SCOPES.map(scope => ({
      scope,
      path,
    }))
  }

  return Array.isArray(option) ? option : [option]
}

async function invalidateMutationQueries(
  app: UniAppContext,
  path: string | undefined,
  option: MutationInvalidateOptions | undefined,
) {
  const descriptors = resolveMutationInvalidate(path, option)
  for (const descriptor of descriptors) {
    await app.queryClient.invalidateQueries(createQueryFilters(app, descriptor))
  }
}

function ensureInitialQueryExecution(
  query: {
    refetch: () => Promise<unknown>
    isFetched: { value: boolean }
    isFetching: { value: boolean }
  },
  enabled: () => boolean,
) {
  onMounted(() => {
    if (!enabled()) {
      return
    }

    if (query.isFetched.value || query.isFetching.value) {
      return
    }

    void query.refetch()
  })
}

export function useList<T = Dict>(appOrOptions: UniAppContext | UseListOptions<T>, maybeOptions?: UseListOptions<T>) {
  const { app, options = {} as UseListOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const pagination = ref(normalizePagination(unref(options.pagination)))

  watch(() => unref(options.pagination), (value) => {
    pagination.value = normalizePagination(value)
  }, {
    deep: true,
  })

  watch(() => [
    unref(options.path),
    unref(options.filters),
    unref(options.sorters),
    unref(options.meta),
  ], () => {
    if (pagination.value.enabled) {
      pagination.value.page = 1
    }
  }, {
    deep: true,
  })

  const query = useQuery(() => {
    const path = unref(options.path)
    const filters = unref(options.filters) || {}
    const sorters = unref(options.sorters) || {}
    const meta = unref(options.meta) || {}
    const params = buildListInput({
      path,
      pagination: pagination.value,
      filters,
      sorters,
      meta,
    })

    return {
      queryKey: getQueryKey(app, {
        scope: 'list',
        path,
        params,
      }),
      queryFn: async () => {
        await app.ready
        return await provider.getList(params, app, app.session.getAuth() || null) as UniDataResult<T[]>
      },
      enabled: Boolean(path) && unref(options.enabled) !== false,
      ...(options.queryOptions || {}),
    }
  }, app.queryClient)

  ensureInitialQueryExecution(query, () => Boolean(unref(options.path)) && unref(options.enabled) !== false)

  const total = computed(() => {
    if (!query.data.value) {
      return 0
    }
    return provider.getTotal(query.data.value)
  })

  const pageCount = computed(() => {
    const pageSize = pagination.value.pageSize || total.value || 1
    return pageSize > 0 ? Math.ceil(total.value / pageSize) : 0
  })

  return {
    ...query,
    pagination,
    total,
    pageCount,
  }
}

export function useInfiniteList<T = Dict>(appOrOptions: UniAppContext | UseInfiniteListOptions<T>, maybeOptions?: UseInfiniteListOptions<T>) {
  const { app, options = {} as UseInfiniteListOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const pagination = ref(normalizePagination(unref(options.pagination)))

  watch(() => unref(options.pagination), (value) => {
    pagination.value = normalizePagination(value)
  }, {
    deep: true,
  })

  const query = useInfiniteQuery(() => {
    const path = unref(options.path)
    const filters = unref(options.filters) || {}
    const sorters = unref(options.sorters) || {}
    const meta = unref(options.meta) || {}

    return {
      queryKey: getQueryKey(app, {
        scope: 'infinite',
        path,
        params: {
          filters,
          sorters,
          meta,
          pageSize: pagination.value.pageSize,
        },
      }),
      initialPageParam: pagination.value.page || 1,
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        await app.ready
        return await provider.getList(buildListInput({
          path,
          pagination: {
            enabled: true,
            page: Number(pageParam) || 1,
            pageSize: pagination.value.pageSize,
          },
          filters,
          sorters,
          meta,
        }), app, app.session.getAuth() || null) as UniDataResult<T[]>
      },
      getNextPageParam: (lastPage: UniDataResult<T[]>, _pages: UniDataResult<T[]>[], lastPageParam: number) => {
        const total = provider.getTotal(lastPage)
        const currentTotal = (Number(lastPageParam) || 1) * pagination.value.pageSize
        if (currentTotal >= total) {
          return undefined
        }
        return (Number(lastPageParam) || 1) + 1
      },
      enabled: Boolean(path) && unref(options.enabled) !== false,
      ...(options.queryOptions || {}),
    } as any
  }, app.queryClient)

  ensureInitialQueryExecution(query, () => Boolean(unref(options.path)) && unref(options.enabled) !== false)

  const items = computed(() => {
    const pages = (query.data.value?.pages || []) as UniDataResult<T[]>[]
    return pages.flatMap(page => Array.isArray(page.data) ? page.data : [])
  })

  const total = computed(() => {
    const pages = (query.data.value?.pages || []) as UniDataResult<T[]>[]
    const lastPage = pages[pages.length - 1]
    if (!lastPage) {
      return 0
    }
    return provider.getTotal(lastPage)
  })

  const pageCount = computed(() => {
    const pageSize = pagination.value.pageSize || total.value || 1
    return pageSize > 0 ? Math.ceil(total.value / pageSize) : 0
  })

  return {
    ...query,
    items,
    pagination,
    total,
    pageCount,
  }
}

export function useOne<T = Dict>(appOrOptions: UniAppContext | UseOneOptions<T>, maybeOptions?: UseOneOptions<T>) {
  const { app, options = {} as UseOneOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)

  const query = useQuery(() => {
    const path = unref(options.path)
    const id = unref(options.id)
    const meta = unref(options.meta) || {}
    const input: UniGetOneOptions = {
      path: path || '',
      id,
      meta,
    }

    return {
      queryKey: getQueryKey(app, {
        scope: 'one',
        path,
        id,
        params: meta,
      }),
      queryFn: async () => {
        await app.ready
        return await provider.getOne(input, app, app.session.getAuth() || null) as UniDataResult<T>
      },
      enabled: Boolean(path) && id !== undefined && id !== null && unref(options.enabled) !== false,
      ...(options.queryOptions || {}),
    }
  }, app.queryClient)

  ensureInitialQueryExecution(query, () => {
    const path = unref(options.path)
    const id = unref(options.id)
    return Boolean(path) && id !== undefined && id !== null && unref(options.enabled) !== false
  })

  return query
}

export function useMany<T = Dict>(appOrOptions: UniAppContext | UseManyOptions<T>, maybeOptions?: UseManyOptions<T>) {
  const { app, options = {} as UseManyOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)

  const query = useQuery(() => {
    const path = unref(options.path)
    const ids = unref(options.ids) || []
    const meta = unref(options.meta) || {}
    const input: UniGetManyOptions = {
      path: path || '',
      ids,
      meta,
    }

    return {
      queryKey: getQueryKey(app, {
        scope: 'many',
        path,
        params: {
          ids,
          meta,
        },
      }),
      queryFn: async () => {
        await app.ready
        return await provider.getMany(input, app, app.session.getAuth() || null) as UniDataResult<T[]>
      },
      enabled: Boolean(path) && ids.length > 0 && unref(options.enabled) !== false,
      ...(options.queryOptions || {}),
    }
  }, app.queryClient)

  ensureInitialQueryExecution(query, () => {
    const path = unref(options.path)
    const ids = unref(options.ids) || []
    return Boolean(path) && ids.length > 0 && unref(options.enabled) !== false
  })

  return query
}

export function useCustom<T = unknown>(appOrOptions: UniAppContext | UseCustomOptions<T>, maybeOptions?: UseCustomOptions<T>) {
  const { app, options = {} as UseCustomOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)

  const query = useQuery(() => {
    const path = unref(options.path)
    const input: UniCustomOptions = {
      path,
      method: unref(options.method),
      query: unref(options.query),
      filters: unref(options.filters),
      sorters: unref(options.sorters),
      payload: unref(options.payload),
      headers: unref(options.headers),
      meta: unref(options.meta),
    }

    return {
      queryKey: getQueryKey(app, {
        scope: 'custom',
        path,
        params: input,
      }),
      queryFn: async () => {
        await app.ready
        return await provider.custom(input, app, app.session.getAuth() || null) as UniDataResult<T>
      },
      enabled: Boolean(path) && unref(options.enabled) !== false,
      ...(options.queryOptions || {}),
    }
  }, app.queryClient)

  ensureInitialQueryExecution(query, () => Boolean(unref(options.path)) && unref(options.enabled) !== false)

  return query
}

export function useCreate<T = unknown>(appOrOptions?: UniAppContext | UseCreateOptions<T>, maybeOptions: UseCreateOptions<T> = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const mutation = useMutation({
    mutationFn: async (input: Partial<UniMutateOptions> = {}) => {
      await app.ready
      const path = input.path || unref(options.path)
      const result = await provider.create({
        path,
        data: input.data ?? unref(options.data),
        meta: input.meta || unref(options.meta),
      }, app, app.session.getAuth() || null) as UniDataResult<T>
      await invalidateMutationQueries(app, path, options.invalidate)
      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    create: mutation.mutateAsync,
  }
}

export function useUpdate<T = unknown>(appOrOptions?: UniAppContext | UseUpdateOptions<T>, maybeOptions: UseUpdateOptions<T> = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const mutation = useMutation({
    mutationFn: async (input: Partial<UniMutateOptions> = {}) => {
      await app.ready
      const path = input.path || unref(options.path)
      const result = await provider.update({
        path,
        id: input.id ?? unref(options.id),
        data: input.data ?? unref(options.data),
        meta: input.meta || unref(options.meta),
      }, app, app.session.getAuth() || null) as UniDataResult<T>
      await invalidateMutationQueries(app, path, options.invalidate)
      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    update: mutation.mutateAsync,
  }
}

export function useDelete<T = unknown>(appOrOptions?: UniAppContext | UseDeleteOptions<T>, maybeOptions: UseDeleteOptions<T> = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const mutation = useMutation({
    mutationFn: async (input: Partial<UniMutateOptions> = {}) => {
      await app.ready
      const path = input.path || unref(options.path)
      const result = await provider.deleteOne({
        path,
        id: input.id ?? unref(options.id),
        meta: input.meta || unref(options.meta),
      }, app, app.session.getAuth() || null) as UniDataResult<T>
      await invalidateMutationQueries(app, path, options.invalidate)
      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    remove: mutation.mutateAsync,
  }
}

export function useCustomMutation<T = unknown>(appOrOptions?: UniAppContext | UseCustomMutationOptions<T>, maybeOptions: UseCustomMutationOptions<T> = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const mutation = useMutation({
    mutationFn: async (input: Partial<UniCustomOptions> = {}) => {
      await app.ready
      const path = input.path || unref(options.path)
      const result = await provider.custom({
        path,
        method: input.method || unref(options.method),
        query: input.query || unref(options.query),
        filters: input.filters || unref(options.filters),
        sorters: input.sorters || unref(options.sorters),
        payload: input.payload ?? unref(options.payload),
        headers: input.headers || unref(options.headers),
        meta: input.meta || unref(options.meta),
      }, app, app.session.getAuth() || null) as UniDataResult<T>
      await invalidateMutationQueries(app, path, options.invalidate)
      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    execute: mutation.mutateAsync,
  }
}
