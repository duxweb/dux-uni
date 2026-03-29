import type { MaybeRef } from 'vue'
import type { Dict, UniAppContext } from '../types'
import { computed, ref, shallowRef, unref, watch } from 'vue'
import { getDataProvider, resolveHookAppOptions } from './shared'

export interface UseTreeOptions<T = Dict> {
  path?: MaybeRef<string | undefined>
  params?: MaybeRef<Dict | undefined>
  convertTree?: boolean
  treeOptions?: {
    idKey?: string
    parentKey?: string
    childrenKey?: string
    sortKey?: string
  }
  immediate?: boolean
}

function arrayToTree<T extends Dict>(
  items: T[],
  options: Required<NonNullable<UseTreeOptions['treeOptions']>>,
) {
  const nodeMap = new Map<any, T & { [key: string]: any }>()
  const roots: Array<T & { [key: string]: any }> = []

  items.forEach((item) => {
    nodeMap.set(item[options.idKey], {
      ...item,
      [options.childrenKey]: [],
    })
  })

  const normalized = [...nodeMap.values()].sort((a, b) => Number(a[options.sortKey] || 0) - Number(b[options.sortKey] || 0))

  normalized.forEach((item) => {
    const parentId = item[options.parentKey]
    const parent = nodeMap.get(parentId)
    if (parent && parentId !== item[options.idKey]) {
      parent[options.childrenKey].push(item)
      return
    }
    roots.push(item)
  })

  return roots
}

function treeToList<T extends Dict>(items: T[], childrenKey: string) {
  const output: T[] = []
  const visit = (nodes: T[]) => {
    nodes.forEach((node) => {
      output.push(node)
      const children = node[childrenKey]
      if (Array.isArray(children)) {
        visit(children)
      }
    })
  }
  visit(items)
  return output
}

export function useTree<T extends Dict = Dict>(appOrOptions: UniAppContext | UseTreeOptions<T>, maybeOptions?: UseTreeOptions<T>) {
  const { app, options = {} as UseTreeOptions<T> } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const provider = getDataProvider(app)
  const loading = ref(false)
  const rawItems = shallowRef<T[]>([])

  const resolvedTreeOptions = computed(() => ({
    idKey: options.treeOptions?.idKey || 'id',
    parentKey: options.treeOptions?.parentKey || 'parent_id',
    childrenKey: options.treeOptions?.childrenKey || 'children',
    sortKey: options.treeOptions?.sortKey || 'sort',
  }))

  async function refresh() {
    const path = unref(options.path)
    if (!path) {
      rawItems.value = []
      return []
    }

    loading.value = true
    try {
      const result = await provider.getList({
        path,
        filters: {
          ...(unref(options.params) || {}),
        },
      }, app, app.session.getAuth() || null)

      rawItems.value = Array.isArray(result.data) ? result.data as T[] : []
      return rawItems.value
    }
    finally {
      loading.value = false
    }
  }

  const items = computed(() => {
    if (options.convertTree === false) {
      return rawItems.value
    }
    return arrayToTree(rawItems.value, resolvedTreeOptions.value)
  })

  const flatItems = computed(() => {
    if (options.convertTree === false) {
      return rawItems.value
    }
    return treeToList(items.value as T[], resolvedTreeOptions.value.childrenKey)
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

  return {
    items,
    flatItems,
    loading: computed(() => loading.value),
    refresh,
  }
}
