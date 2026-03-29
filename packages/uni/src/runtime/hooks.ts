import type { UniHookExecutionContext, UniHookHandler } from '../types'

export function createHookRegistry() {
  const store = new Map<string, UniHookHandler[]>()

  function ensure(name: string) {
    const list = store.get(name) || []
    store.set(name, list)
    return list
  }

  return {
    tap(name: string, handler: UniHookHandler) {
      const list = ensure(name)
      list.push(handler)
      return () => {
        const current = store.get(name)
        if (!current) {
          return
        }
        store.set(name, current.filter(item => item !== handler))
      }
    },
    async collect<TResult = unknown>(name: string, payload?: unknown, meta?: Record<string, unknown>) {
      const list = store.get(name) || []
      const output: TResult[] = []
      for (const handler of list) {
        output.push(await handler(payload, {
          hook: name,
          meta,
        } as UniHookExecutionContext) as TResult)
      }
      return output
    },
    async waterfall<TResult = unknown>(name: string, payload: TResult, meta?: Record<string, unknown>) {
      let output = payload
      const list = store.get(name) || []
      for (const handler of list) {
        output = await handler(output, {
          hook: name,
          meta,
        } as UniHookExecutionContext) as TResult
      }
      return output
    },
    clear(name?: string) {
      if (!name) {
        store.clear()
        return
      }
      store.delete(name)
    },
    list() {
      return [...store.keys()]
    },
  }
}
