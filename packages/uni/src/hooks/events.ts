import type { UniAppContext, UniEventHandler } from '../types'
import { onUnmounted } from 'vue'
import { useDux } from '../app/install'

function resolveEventHookInput(appOrPriority?: UniAppContext | number, maybePriority?: number) {
  if (typeof appOrPriority === 'number') {
    return {
      app: undefined,
      priority: appOrPriority,
    }
  }

  return {
    app: appOrPriority,
    priority: maybePriority || 0,
  }
}

export function useListener<T = unknown>(
  name: string,
  handler: (payload?: T) => void,
  appOrPriority?: UniAppContext | number,
  maybePriority?: number,
) {
  const { app, priority } = resolveEventHookInput(appOrPriority, maybePriority)
  const runtime = app || useDux()
  const off = runtime.events.on(name, handler as UniEventHandler, {
    priority,
  })

  onUnmounted(() => {
    off()
  })

  return {
    off,
  }
}

export function useListenerOnce<T = unknown>(
  name: string,
  handler: (payload?: T) => void,
  appOrPriority?: UniAppContext | number,
  maybePriority?: number,
) {
  const { app, priority } = resolveEventHookInput(appOrPriority, maybePriority)
  const runtime = app || useDux()
  const off = runtime.events.once(name, handler as UniEventHandler, {
    priority,
  })

  onUnmounted(() => {
    off()
  })

  return {
    off,
  }
}

export function useListenerOnly<T = unknown>(
  name: string,
  handler: (payload?: T) => void,
  appOrPriority?: UniAppContext | number,
  maybePriority?: number,
) {
  const { app, priority } = resolveEventHookInput(appOrPriority, maybePriority)
  const runtime = app || useDux()
  const off = runtime.events.on(name, handler as UniEventHandler, {
    priority,
    only: true,
  })

  onUnmounted(() => {
    off()
  })

  return {
    off,
  }
}

export function useEvent<T = unknown>(name: string, app?: UniAppContext) {
  const runtime = app || useDux()

  return {
    emit(payload?: T) {
      runtime.events.emit(name, payload)
    },
    trigger(payload?: T) {
      runtime.events.emit(name, payload)
    },
  }
}
