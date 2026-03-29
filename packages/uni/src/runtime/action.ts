import type { UniActionContext, UniActionHandler, UniActionRegistry } from '../types'

export function createActionRegistry(initialHandlers?: Record<string, UniActionHandler>): UniActionRegistry {
  const handlers = new Map<string, UniActionHandler>(Object.entries(initialHandlers || {}))

  return {
    register(name, handler) {
      handlers.set(name, handler)
    },
    unregister(name) {
      handlers.delete(name)
    },
    async execute(name, context: UniActionContext) {
      const handler = handlers.get(name)
      if (!handler) {
        throw new Error(`Unknown action "${name}"`)
      }
      return await handler(context)
    },
    list() {
      return [...handlers.keys()]
    },
  }
}
