import type { InjectionKey } from 'vue'

export interface OverlayContentApi {
  submit?: () => unknown | Promise<unknown>
  refreshLayout?: () => void | Promise<void>
}

export type OverlayContentApiRegistrar = (api?: OverlayContentApi) => void

export const OVERLAY_CONTENT_API_KEY: InjectionKey<OverlayContentApiRegistrar> = Symbol('dux.uni-pro.overlay-content-api')
