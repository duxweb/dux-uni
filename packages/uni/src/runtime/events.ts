import type { UniEventHandler, UniEventListenerOptions } from '../types'

interface EventListenerEntry {
  handler: UniEventHandler
  options: UniEventListenerOptions
  order: number
}

export function createEventBus() {
  const store = new Map<string, EventListenerEntry[]>()
  const names = new Set<string>()
  let order = 0

  function ensure(name: string) {
    const list = store.get(name) || []
    store.set(name, list)
    return list
  }

  function sortListeners(list: EventListenerEntry[]) {
    return [...list].sort((a, b) => {
      const priorityDiff = (b.options.priority || 0) - (a.options.priority || 0)
      if (priorityDiff !== 0) {
        return priorityDiff
      }
      return b.order - a.order
    })
  }

  function removeEntry(name: string, handler: UniEventHandler) {
    const current = store.get(name)
    if (!current) {
      return
    }
    store.set(name, current.filter(item => item.handler !== handler))
  }

  return {
    on(name: string, handler: UniEventHandler, options: UniEventListenerOptions = {}) {
      names.add(name)
      const entry: EventListenerEntry = {
        handler,
        options,
        order: order++,
      }
      ensure(name).push(entry)
      return () => {
        removeEntry(name, handler)
      }
    },
    once(name: string, handler: UniEventHandler, options: Omit<UniEventListenerOptions, 'once'> = {}) {
      return this.on(name, handler, {
        ...options,
        once: true,
      })
    },
    off(name: string, handler: UniEventHandler) {
      removeEntry(name, handler)
    },
    emit(name: string, payload?: unknown) {
      names.add(name)
      const current = store.get(name) || []
      const sorted = sortListeners(current)
      const onlyListeners = sorted.filter(item => item.options.only)
      const queue = onlyListeners.length ? onlyListeners.slice(0, 1) : sorted

      queue.forEach((item) => {
        item.handler(payload)
        if (item.options.once) {
          removeEntry(name, item.handler)
        }
      })
    },
    clear() {
      names.clear()
      store.clear()
    },
    list() {
      return [...names]
    },
  }
}
