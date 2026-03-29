import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  createUniQueryClient,
  useCreate,
  useCustom,
  useCustomMutation,
  useDelete,
  useInvalidate,
  useList,
  useMany,
  useOne,
  useUpdate,
} from '../src'

function createDataApp() {
  let items = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
  ]

  const app = {
    ready: Promise.resolve(),
    queryClient: createUniQueryClient(),
    config: {
      appName: 'query-test',
      dataProvider: {
        async getList(input: any) {
          const page = input.pagination?.page || 1
          const pageSize = input.pagination?.pageSize || items.length
          const start = (page - 1) * pageSize
          return {
            data: items.slice(start, start + pageSize),
            meta: {
              total: items.length,
            },
          }
        },
        async getOne(input: any) {
          return {
            data: items.find(item => item.id === input.id),
          }
        },
        async getMany(input: any) {
          return {
            data: items.filter(item => input.ids.includes(item.id)),
          }
        },
        async create(input: any) {
          const next = {
            id: items.length + 1,
            ...(input.data || {}),
          }
          items = [...items, next]
          return {
            data: next,
          }
        },
        async update(input: any) {
          items = items.map(item => item.id === input.id ? { ...item, ...(input.data || {}) } : item)
          return {
            data: items.find(item => item.id === input.id),
          }
        },
        async deleteOne(input: any) {
          const current = items.find(item => item.id === input.id)
          items = items.filter(item => item.id !== input.id)
          return {
            data: current,
          }
        },
        async custom(input: any) {
          return {
            data: {
              method: input.method || 'GET',
              size: items.length,
            },
          }
        },
        getTotal(result: any) {
          return result.meta?.total || 0
        },
      },
    },
    navigator: {},
    router: {},
    session: {
      getAuth() {
        return null
      },
    },
  } as any

  return {
    app,
    setItems(next: typeof items) {
      items = next
    },
  }
}

describe('query data hooks', () => {
  it('handles queries, mutations, and invalidation', async () => {
    setActivePinia(createPinia())
    const { app, setItems } = createDataApp()
    const scope = effectScope()

    const hooks = scope.run(() => ({
      list: useList(app, {
        path: 'posts',
        pagination: true,
      }),
      one: useOne(app, {
        path: 'posts',
        id: 1,
      }),
      many: useMany(app, {
        path: 'posts',
        ids: [1, 2],
      }),
      custom: useCustom(app, {
        path: 'stats',
        method: 'GET',
      }),
      create: useCreate(app, {
        path: 'posts',
        invalidate: true,
      }),
      update: useUpdate(app, {
        path: 'posts',
        id: 1,
        invalidate: true,
      }),
      remove: useDelete(app, {
        path: 'posts',
        id: 2,
        invalidate: true,
      }),
      customMutation: useCustomMutation(app, {
        path: 'stats',
        method: 'POST',
        invalidate: true,
      }),
      invalidate: useInvalidate(app),
    }))!

    await hooks.list.refetch()
    await hooks.one.refetch()
    await hooks.many.refetch()
    await hooks.custom.refetch()

    expect(hooks.list.data.value?.data).toEqual([
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ])
    expect(hooks.list.total.value).toBe(2)
    expect(hooks.one.data.value?.data).toEqual({ id: 1, name: 'Alpha' })
    expect(hooks.many.data.value?.data).toHaveLength(2)
    expect(hooks.custom.data.value?.data).toEqual({ method: 'GET', size: 2 })

    await hooks.create.create({
      data: {
        name: 'Gamma',
      },
    })
    await hooks.update.update({
      data: {
        name: 'Alpha 2',
      },
    })
    expect(hooks.list.data.value?.data).toEqual([
      { id: 1, name: 'Alpha 2' },
      { id: 2, name: 'Beta' },
      { id: 3, name: 'Gamma' },
    ])

    await hooks.remove.remove({})
    expect(hooks.list.data.value?.data).toEqual([
      { id: 1, name: 'Alpha 2' },
      { id: 3, name: 'Gamma' },
    ])

    await hooks.customMutation.execute({})

    setItems([
      { id: 1, name: 'Alpha 3' },
      { id: 3, name: 'Gamma' },
    ])
    await hooks.invalidate.invalidate({
      scope: 'list',
      path: 'posts',
    })

    expect(hooks.list.data.value?.data).toEqual([
      { id: 1, name: 'Alpha 3' },
      { id: 3, name: 'Gamma' },
    ])

    scope.stop()
  })
})
