export interface OverlayViewportMetrics {
  topGap: number
  bottomGap: number
  modalMaxHeight: string
  bottomDrawerMaxHeight: string
  bottomDrawerContentMaxHeight: string
}

function resolveWindowInfo() {
  const getWindowInfo = (uni as typeof uni & {
    getWindowInfo?: () => {
      statusBarHeight?: number
      windowHeight?: number
      screenHeight?: number
      safeArea?: { bottom?: number }
      safeAreaInsets?: { bottom?: number }
    }
  }).getWindowInfo

  if (typeof getWindowInfo === 'function') {
    return getWindowInfo()
  }

  const getSystemInfoSync = (uni as typeof uni & {
    getSystemInfoSync?: () => {
      statusBarHeight?: number
      windowHeight?: number
      screenHeight?: number
      safeArea?: { bottom?: number }
      safeAreaInsets?: { bottom?: number }
    }
  }).getSystemInfoSync

  if (typeof getSystemInfoSync === 'function') {
    return getSystemInfoSync()
  }

  return undefined
}

function resolveMenuButtonRect() {
  const getMenuButtonBoundingClientRect = (uni as typeof uni & {
    getMenuButtonBoundingClientRect?: () => {
      top?: number
      bottom?: number
      height?: number
    }
  }).getMenuButtonBoundingClientRect

  if (typeof getMenuButtonBoundingClientRect !== 'function') {
    return undefined
  }

  const rect = getMenuButtonBoundingClientRect()
  if (!rect || !rect.height) {
    return undefined
  }

  return rect
}

export function useOverlayViewport(): OverlayViewportMetrics {
  const windowInfo = resolveWindowInfo()
  const menuButtonRect = resolveMenuButtonRect()
  const statusBarHeight = Number(windowInfo?.statusBarHeight || 0)
  const screenHeight = Number(windowInfo?.screenHeight || windowInfo?.windowHeight || 0)
  const safeAreaBottom = Number(
    windowInfo?.safeAreaInsets?.bottom
      || (screenHeight && windowInfo?.safeArea?.bottom
        ? Math.max(screenHeight - Number(windowInfo.safeArea.bottom || 0), 0)
        : 0),
  )

  const topInset = (() => {
    if (menuButtonRect?.bottom) {
      const topGap = Math.max(Number(menuButtonRect.top || 0) - statusBarHeight, 0)
      return Math.max(Math.round(Number(menuButtonRect.bottom || 0) + topGap), statusBarHeight + 44)
    }

    if (statusBarHeight > 0) {
      return statusBarHeight + 44
    }

    return 16
  })()

  const topGap = Math.max(topInset + 12, 16)
  const bottomGap = Math.max(safeAreaBottom + 12, 16)
  const modalVerticalGap = topGap + bottomGap + 24
  const bottomDrawerMaxHeightPx = screenHeight
    ? Math.max(Math.floor(Math.min(screenHeight * 0.8, screenHeight - topGap - 16)), 320)
    : 0
  const bottomDrawerMaxHeight = bottomDrawerMaxHeightPx
    ? `${bottomDrawerMaxHeightPx}px`
    : '80vh'

  return {
    topGap,
    bottomGap,
    modalMaxHeight: `calc(100vh - ${modalVerticalGap}px)`,
    bottomDrawerMaxHeight,
    bottomDrawerContentMaxHeight: `calc(${bottomDrawerMaxHeight} - 220rpx - ${bottomGap}px)`,
  }
}
