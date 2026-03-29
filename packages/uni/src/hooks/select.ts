import type { MaybeRef } from 'vue'
import type { Dict, UniAppContext } from '../types'
import { computed, reactive, ref, shallowRef, unref, watch } from 'vue'
import { getDataProvider, resolveHookAppOptions } from './shared'

type SelectValue = Array<string | number> | string | number | null | undefined

export interface UniSelectOption<T = Dict> {
  label: string
  value: string | number
  key: string | number
  raw: T
}

export interface UseSelectOptions<T = Dict> {
  path?: MaybeRef<string | undefined>
  params?: MaybeRef<Dict | undefined>
  defaultValue?: MaybeRef<SelectValue>
  optionLabel?: string | ((item: T) => string)
  optionValue?: string | ((item: T) => string | number)
  optionKey?: string | ((item: T) => string | number)
  keywordField?: string
  pagination?: boolean | number
  immediate?: boolean
  debounce?: number
}

function getField<T extends Dict>(
  item: T,
  field: string | ((item: T) => string | number) | undefined,
  fallbacks: string[],
) {
  if (typeof field === 'function') {
    return field(item)
  }
  if (typeof field === 'string' && item[field] != null) {
    return item[field]
  }
  for (const key of fallbacks) {
    if (item[key] != null) {
      return item[key]
    }
  }
  return undefined
}

function formatOption<T extends Dict>(item: T, options: UseSelectOptions<T>): UniSelectOption<T> {
  const key = getField(item, options.optionKey || options.optionValue, ['value', 'id'])
  const label = getField(item, options.optionLabel as any, ['label', 'name', 'title', 'value', 'id'])
  const value = getField(item, options.optionValue, ['value', 'id'])

  return {
    key: key as string | number,
    value: value as string | number,
    label: String(label ?? ''),
    raw: item,
  }
}

function toItem<T extends Dict>(item: unknown) {
  return item as T
}

export function useSelect<T extends Dict = Dict>(appOrOptions: UniAppContext | UseSelectOptions<T>, maybeOptions?: UseSelectOptions<T>) {
  const { app, options = {} as UseSelectOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const items = shallowRef<T[]>([])
  const selectedItems = shallowRef<T[]>([])
  const loading = ref(false)
  const total = ref(0)
  const pageCount = ref(0)
  const keyword = ref('')
  const pagination = reactive({
    page: 1,
    pageSize: typeof options.pagination === 'number' ? options.pagination : options.pagination ? 20 : 0,
  })

  let searchTimer: ReturnType<typeof setTimeout> | undefined

  async function refresh() {
    const path = unref(options.path)
    if (!path) {
      items.value = []
      return []
    }

    loading.value = true

    try {
      const result = await provider.getList({
        path,
        pagination: options.pagination
          ? {
              page: pagination.page,
              pageSize: pagination.pageSize,
            }
          : undefined,
        filters: {
          ...(unref(options.params) || {}),
          ...(keyword.value ? { [options.keywordField || 'keyword']: keyword.value } : {}),
        },
      }, app, app.session.getAuth() || null)

      items.value = Array.isArray(result.data) ? result.data as T[] : []
      total.value = provider.getTotal(result)
      const pageSize = pagination.pageSize || total.value || 1
      pageCount.value = pageSize > 0 ? Math.ceil(total.value / pageSize) : 0
      return items.value
    }
    finally {
      loading.value = false
    }
  }

  async function hydrateSelected() {
    const path = unref(options.path)
    const currentValue = unref(options.defaultValue)
    const ids = Array.isArray(currentValue) ? currentValue : currentValue != null ? [currentValue] : []

    if (!path || ids.length === 0) {
      selectedItems.value = []
      return
    }

    const exists = ids.every(id => items.value.some(item => formatOption(toItem<T>(item), options).value === id))
    if (exists) {
      return
    }

    const result = await provider.getMany({
      path,
      ids,
    }, app, app.session.getAuth() || null)

    selectedItems.value = Array.isArray(result.data) ? result.data as T[] : []
  }

  function search(value: string) {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    const delay = options.debounce ?? 300
    searchTimer = setTimeout(() => {
      keyword.value = value
      void refresh()
    }, delay)
  }

  const mappedOptions = computed(() => {
    const seen = new Set<string | number>()
    const merged = [...selectedItems.value, ...items.value]

    return merged
      .map(item => formatOption(toItem<T>(item), options))
      .filter((item) => {
        if (seen.has(item.key)) {
          return false
        }
        seen.add(item.key)
        return true
      })
  })

  watch(() => [unref(options.path), unref(options.params)], () => {
    if (options.immediate === false) {
      return
    }
    void refresh()
  }, {
    deep: true,
    immediate: true,
  })

  watch(() => unref(options.defaultValue), () => {
    void hydrateSelected()
  }, {
    deep: true,
    immediate: true,
  })

  return {
    items,
    options: mappedOptions,
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    pageCount: computed(() => pageCount.value),
    pagination,
    keyword,
    search,
    refresh,
    hydrateSelected,
  }
}
