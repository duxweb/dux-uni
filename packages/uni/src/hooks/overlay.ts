import type { InjectionKey } from 'vue'
import type {
  UniAppContext,
  UniConfirmOverlayRequest,
  UniFormOverlayRequest,
  UniOverlayConfirmContext,
} from '../types'
import { computed, inject } from 'vue'
import { useUniApp } from '../app/install'
import { resolveHookAppOptions } from './shared'

export const UNI_OVERLAY_CONTEXT_KEY: InjectionKey<UniOverlayConfirmContext> = Symbol('dux.uni.overlay')

export function useOverlayContext<TPayload = unknown, TResult = unknown>() {
  const context = inject<UniOverlayConfirmContext<TPayload, TResult> | undefined>(UNI_OVERLAY_CONTEXT_KEY)
  if (!context) {
    throw new Error('Overlay context is not available outside of an overlay content component')
  }
  return context
}

export function useOverlayEntries(app?: UniAppContext) {
  const runtime = app || useUniApp()
  return computed(() => runtime.overlay.entries)
}

export function useConfirm(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)

  return {
    open<TPayload = unknown>(options: UniConfirmOverlayRequest<TPayload, boolean>) {
      return app.overlay.open<TPayload, boolean>({
        kind: 'confirm',
        ...options,
      }).then(result => Boolean(result))
    },
  }
}

export function useModal(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)

  return {
    open<TPayload = unknown, TResult = unknown>(options: Omit<UniFormOverlayRequest<TPayload, TResult>, 'kind'>) {
      return app.overlay.open<TPayload, TResult>({
        kind: 'modal',
        ...options,
      })
    },
  }
}

/**
 * @deprecated Prefer `useModal()`.
 */
export function useModalForm(appOrNothing?: UniAppContext) {
  return useModal(appOrNothing)
}

export function useDrawer(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)

  return {
    open<TPayload = unknown, TResult = unknown>(options: Omit<UniFormOverlayRequest<TPayload, TResult>, 'kind'>) {
      return app.overlay.open<TPayload, TResult>({
        kind: 'drawer',
        ...options,
      })
    },
  }
}

/**
 * @deprecated Prefer `useDrawer()`.
 */
export function useDrawerForm(appOrNothing?: UniAppContext) {
  return useDrawer(appOrNothing)
}
