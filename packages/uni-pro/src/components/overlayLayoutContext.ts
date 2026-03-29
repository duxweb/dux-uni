import type { InjectionKey } from 'vue'
import type { UniOverlayEntry } from '@duxweb/uni'
import type { OverlayViewportMetrics } from './useOverlayViewport'

export interface OverlayLayoutContext {
  entry: UniOverlayEntry
  viewport: OverlayViewportMetrics
}

export const OVERLAY_LAYOUT_CONTEXT_KEY: InjectionKey<OverlayLayoutContext> = Symbol('dux.uni-pro.overlay-layout')
