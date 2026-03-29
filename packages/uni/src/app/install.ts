import type { InjectionKey } from 'vue'
import type { UniAppContext } from '../types'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { inject } from 'vue'
import { syncRuntimeStores } from '../runtime/state'
import { installNativeThemeRuntime } from '../runtime/theme'

export const UNI_APP_KEY: InjectionKey<UniAppContext> = Symbol('dux.uni')
export const OVERLAY_REGISTRY_COMPONENT_NAME = 'DuxAppOverlayRegistry'

function ensureAbortController() {
  if (typeof globalThis.AbortController !== 'undefined') {
    return
  }

  class PolyfillAbortSignal {
    aborted = false
    reason: unknown = undefined
    onabort: ((event: { type: 'abort', target: PolyfillAbortSignal }) => void) | null = null
    private listeners = new Set<(event: { type: 'abort', target: PolyfillAbortSignal }) => void>()

    addEventListener(_type: string, listener?: ((event: { type: 'abort', target: PolyfillAbortSignal }) => void) | null) {
      if (listener) {
        this.listeners.add(listener)
      }
    }

    removeEventListener(_type: string, listener?: ((event: { type: 'abort', target: PolyfillAbortSignal }) => void) | null) {
      if (listener) {
        this.listeners.delete(listener)
      }
    }

    dispatchEvent(event: { type: 'abort', target: PolyfillAbortSignal }) {
      this.listeners.forEach(listener => listener(event))
      this.onabort?.(event)
      return true
    }

    throwIfAborted() {
      if (this.aborted) {
        throw this.reason instanceof Error ? this.reason : new Error('Aborted')
      }
    }
  }

  class PolyfillAbortController {
    signal = new PolyfillAbortSignal()

    abort(reason?: unknown) {
      if (this.signal.aborted) {
        return
      }
      this.signal.aborted = true
      this.signal.reason = reason
      this.signal.dispatchEvent({
        type: 'abort',
        target: this.signal,
      })
    }
  }

  const runtime = globalThis as any
  runtime.AbortController = PolyfillAbortController
  runtime.AbortSignal = PolyfillAbortSignal
}

export function installUniApp(app: {
  use: (...args: any[]) => unknown
  provide: (...args: any[]) => unknown
  component?: (name: string, component: unknown) => unknown
}, uni: UniAppContext, pinia?: unknown) {
  ensureAbortController()
  if (pinia) {
    uni.pinia = pinia
  }
  if (uni.config.overlayRegistry && typeof uni.config.overlayRegistry !== 'string' && typeof app.component === 'function') {
    app.component(OVERLAY_REGISTRY_COMPONENT_NAME, uni.config.overlayRegistry)
    uni.config.overlayRegistry = OVERLAY_REGISTRY_COMPONENT_NAME
  }
  app.use(VueQueryPlugin, {
    queryClient: uni.queryClient,
  })
  app.provide(UNI_APP_KEY, uni)
  app.provide('dux.uni', uni)
  installNativeThemeRuntime(uni)
  void uni.ready.then(() => {
    syncRuntimeStores(uni)
  })
  return uni
}

export function useUniApp() {
  const uni = inject(UNI_APP_KEY, inject<UniAppContext>('dux.uni'))
  if (!uni) {
    throw new Error('Dux uni runtime is not available in the current app context')
  }
  return uni
}

export function useDux() {
  return useUniApp()
}
