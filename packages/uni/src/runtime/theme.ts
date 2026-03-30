import type { UniAppContext } from '../types'
import { watch } from 'vue'
import { createUniTheme } from '../dux/theme.ts'
import { useThemeStore } from '../stores/theme.ts'

export type UniResolvedTheme = 'light' | 'dark'
export type UniThemePreferenceCapability = 'manual' | 'system-only'

let cachedPlatform = ''

type UniRuntimeLike = {
  getAppBaseInfo?: () => { hostName?: string, uniPlatform?: string, theme?: string }
  getSystemInfoSync?: () => { theme?: string }
  setNavigationBarColor?: (options: Record<string, unknown>) => unknown
  setBackgroundColor?: (options: Record<string, unknown>) => unknown
  onThemeChange?: (callback: (payload: { theme?: string }) => void) => void
}

function getUniRuntime(): UniRuntimeLike | undefined {
  return (globalThis as typeof globalThis & {
    uni?: UniRuntimeLike
  }).uni
}

export function resolveUniPlatformSync() {
  if (cachedPlatform) {
    return cachedPlatform
  }

  const envPlatform = (
    (typeof process !== 'undefined' && process.env?.UNI_PLATFORM)
    || (typeof process !== 'undefined' && process.env?.VITE_UNI_PLATFORM)
  )

  if (envPlatform) {
    cachedPlatform = String(envPlatform).toLowerCase()
    return cachedPlatform
  }

  const runtimeConfig = (globalThis as typeof globalThis & {
    __uniConfig?: { platform?: unknown }
  }).__uniConfig

  if (runtimeConfig?.platform) {
    cachedPlatform = String(runtimeConfig.platform).toLowerCase()
    return cachedPlatform
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    cachedPlatform = 'h5'
    return cachedPlatform
  }

  const appBase = getUniRuntime()?.getAppBaseInfo

  if (typeof appBase === 'function') {
    const info = appBase() as { hostName?: string, uniPlatform?: string }

    if (info?.uniPlatform) {
      cachedPlatform = String(info.uniPlatform).toLowerCase()
      return cachedPlatform
    }
  }

  const globals = globalThis as typeof globalThis & {
    wx?: unknown
    my?: unknown
    swan?: unknown
    tt?: unknown
    ks?: unknown
    qq?: unknown
    jd?: unknown
    plus?: unknown
  }

  if (globals.wx) {
    cachedPlatform = 'mp-weixin'
    return cachedPlatform
  }
  if (globals.my) {
    cachedPlatform = 'mp-alipay'
    return cachedPlatform
  }
  if (globals.swan) {
    cachedPlatform = 'mp-baidu'
    return cachedPlatform
  }
  if (globals.tt) {
    cachedPlatform = 'mp-toutiao'
    return cachedPlatform
  }
  if (globals.ks) {
    cachedPlatform = 'mp-kuaishou'
    return cachedPlatform
  }
  if (globals.qq) {
    cachedPlatform = 'mp-qq'
    return cachedPlatform
  }
  if (globals.jd) {
    cachedPlatform = 'mp-jd'
    return cachedPlatform
  }
  if (globals.plus) {
    cachedPlatform = 'app-plus'
    return cachedPlatform
  }

  return ''
}

export function resolveThemePreferenceCapabilitySync(): UniThemePreferenceCapability {
  const platform = resolveUniPlatformSync()

  if (platform === 'h5' || platform === 'web' || platform === 'app' || platform.startsWith('app-')) {
    return 'manual'
  }

  return 'system-only'
}

export function resolveSystemThemeSync(): UniResolvedTheme {
  const uniRuntime = getUniRuntime()
  const appBase = uniRuntime?.getAppBaseInfo

  if (typeof appBase === 'function') {
    return appBase().theme === 'dark' ? 'dark' : 'light'
  }

  const getSystemInfoSync = uniRuntime?.getSystemInfoSync

  if (typeof getSystemInfoSync === 'function') {
    return getSystemInfoSync().theme === 'dark' ? 'dark' : 'light'
  }

  return 'light'
}

function resolveCurrentPageCountSync() {
  const getPages = (globalThis as typeof globalThis & {
    getCurrentPages?: () => unknown[]
  }).getCurrentPages

  if (typeof getPages !== 'function') {
    return 0
  }

  try {
    const pages = getPages()
    return Array.isArray(pages) ? pages.length : 0
  }
  catch {
    return 0
  }
}

function shouldDeferNavigationBarApply() {
  const platform = resolveUniPlatformSync()

  if (platform !== 'h5' && platform !== 'web') {
    return false
  }

  return resolveCurrentPageCountSync() === 0
}

function resolveUniErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    const data = error as { errMsg?: unknown, message?: unknown }

    if (typeof data.errMsg === 'string') {
      return data.errMsg
    }

    if (typeof data.message === 'string') {
      return data.message
    }
  }

  return ''
}

function shouldRetryNavigationBarApply(error: unknown) {
  return /page not found/i.test(resolveUniErrorMessage(error))
}

function applyNavigationBarTheme(
  backgroundColor: string,
  frontColor: '#ffffff' | '#000000',
  onRetry: () => void,
) {
  if (shouldDeferNavigationBarApply()) {
    return false
  }

  const apply = getUniRuntime()?.setNavigationBarColor

  if (typeof apply !== 'function') {
    return true
  }

  const request = {
    frontColor,
    backgroundColor,
    animation: {
      duration: 0,
      timingFunc: 'linear' as const,
    },
    fail(error: unknown) {
      if (shouldRetryNavigationBarApply(error)) {
        onRetry()
      }
    },
  }

  try {
    const result = apply(request as any)

    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      void (result as Promise<unknown>).catch((error: unknown) => {
        if (shouldRetryNavigationBarApply(error)) {
          onRetry()
        }
      })
    }

    return true
  }
  catch (error) {
    if (shouldRetryNavigationBarApply(error)) {
      onRetry()
      return false
    }

    throw error
  }
}

function applyNativeTheme(context: UniAppContext, theme: UniResolvedTheme, onRetry: () => void) {
  const tokens = context.config.themeRuntime?.tokens

  if (!tokens) {
    return true
  }

  const palette = createUniTheme(tokens)[theme]
  const uniRuntime = getUniRuntime()

  uniRuntime?.setBackgroundColor?.({
    backgroundColor: palette.bgColor,
    backgroundColorTop: palette.bgColorTop,
    backgroundColorBottom: palette.bgColorBottom,
  })

  return applyNavigationBarTheme(
    palette.navBgColor,
    palette.navTxtStyle === 'white' ? '#ffffff' : '#000000',
    onRetry,
  )
}

export function installNativeThemeRuntime(context: UniAppContext) {
  const options = context.config.themeRuntime

  if (!options?.tokens) {
    return
  }

  const configuredMode = options.mode || 'system'
  const pinia = context.pinia as Parameters<typeof useThemeStore>[0] | undefined

  if (pinia && configuredMode !== 'system') {
    useThemeStore(pinia).setRuntimeThemePreference(configuredMode)
  }

  options.onSystemThemeChange?.(resolveSystemThemeSync(), context)

  let pendingTheme: UniResolvedTheme | undefined
  let retryCount = 0
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  const maxRetryCount = 12

  const flushPendingTheme = () => {
    if (!pendingTheme) {
      return
    }

    const theme = pendingTheme
    const applied = applyNativeTheme(context, theme, () => {
      scheduleThemeApply(theme)
    })

    if (applied) {
      pendingTheme = undefined
      retryCount = 0
    }
  }

  const scheduleThemeApply = (theme: UniResolvedTheme, reset = false) => {
    pendingTheme = theme

    if (reset) {
      retryCount = 0
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = undefined
      }
    }

    if (retryTimer || retryCount >= maxRetryCount) {
      return
    }

    const delay = retryCount === 0 ? 0 : 16
    retryCount += 1
    retryTimer = setTimeout(() => {
      retryTimer = undefined
      flushPendingTheme()
    }, delay)
  }

  const requestThemeApply = (theme: UniResolvedTheme) => {
    pendingTheme = theme
    retryCount = 0
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = undefined
    }
    flushPendingTheme()
  }

  if (typeof options.getTheme === 'function') {
    watch(() => options.getTheme?.(context) || 'light', (theme) => {
      requestThemeApply(theme === 'dark' ? 'dark' : 'light')
    }, {
      immediate: true,
    })
  }
  else {
    requestThemeApply(resolveSystemThemeSync())
  }

  getUniRuntime()?.onThemeChange?.(({ theme }) => {
    const resolvedTheme = theme === 'dark' ? 'dark' : 'light'
    options.onSystemThemeChange?.(resolvedTheme, context)

    if (typeof options.getTheme !== 'function') {
      requestThemeApply(resolvedTheme)
    }
  })
}
