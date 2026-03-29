import { createSharedComposable } from '@vueuse/core'
import { computed } from 'vue'

interface StarterMenuButtonRect {
  top?: number
  bottom?: number
  left?: number
  right?: number
  width?: number
  height?: number
}

function resolveStatusBarHeight() {
  const getWindowInfo = (uni as typeof uni & { getWindowInfo?: () => { statusBarHeight?: number } }).getWindowInfo
  if (typeof getWindowInfo === 'function') {
    return Number(getWindowInfo().statusBarHeight || 0)
  }

  const getSystemInfoSync = (uni as typeof uni & { getSystemInfoSync?: () => { statusBarHeight?: number } }).getSystemInfoSync
  if (typeof getSystemInfoSync === 'function') {
    return Number(getSystemInfoSync().statusBarHeight || 0)
  }

  return 0
}

function resolveMenuButtonRect() {
  const getMenuButtonBoundingClientRect = (uni as typeof uni & {
    getMenuButtonBoundingClientRect?: () => StarterMenuButtonRect
  }).getMenuButtonBoundingClientRect

  if (typeof getMenuButtonBoundingClientRect !== 'function') {
    return null
  }

  const rect = getMenuButtonBoundingClientRect()
  if (!rect || !rect.height) {
    return null
  }

  return rect
}

function resolveNavigationInset() {
  const statusBarHeight = resolveStatusBarHeight()
  const menuButtonRect = resolveMenuButtonRect()

  if (menuButtonRect?.bottom) {
    const topGap = Math.max((menuButtonRect.top || 0) - statusBarHeight, 0)
    return Math.max(Math.round(menuButtonRect.bottom + topGap), statusBarHeight + 44)
  }

  return Math.max(statusBarHeight + 44, 44)
}

export const useStarterNavSpace = createSharedComposable(() => {
  const statusBarHeight = resolveStatusBarHeight()
  const menuButtonRect = resolveMenuButtonRect()
  const immersiveTopInset = resolveNavigationInset()
  const titleBarTop = menuButtonRect?.top || Math.max(statusBarHeight + 8, 16)
  const titleBarHeight = menuButtonRect?.height || 32
  const capsuleWidth = Math.max((menuButtonRect?.width || 96) + 12, 108)

  return {
    immersiveTopInset,
    immersiveTopInsetStyle: computed(() => `calc(${immersiveTopInset}px + 16rpx)`),
    titleBarStyle: computed(() => ({
      paddingTop: `${titleBarTop}px`,
      minHeight: `${titleBarHeight}px`,
    })),
    capsulePlaceholderStyle: computed(() => ({
      width: `${capsuleWidth}px`,
      minWidth: `${capsuleWidth}px`,
      height: `${titleBarHeight}px`,
    })),
  }
})
