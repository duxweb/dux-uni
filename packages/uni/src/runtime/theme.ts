import type { UniAppContext } from '../types'
import { watch } from 'vue'
import { createUniTheme } from '../dux/theme.ts'
import { useThemeStore } from '../stores/theme.ts'

export type UniResolvedTheme = 'light' | 'dark'

export function resolveSystemThemeSync(): UniResolvedTheme {
  const appBase = (uni as typeof uni & {
    getAppBaseInfo?: () => { theme?: string }
  }).getAppBaseInfo

  if (typeof appBase === 'function') {
    return appBase().theme === 'dark' ? 'dark' : 'light'
  }

  const getSystemInfoSync = (uni as typeof uni & {
    getSystemInfoSync?: () => { theme?: string }
  }).getSystemInfoSync

  if (typeof getSystemInfoSync === 'function') {
    return getSystemInfoSync().theme === 'dark' ? 'dark' : 'light'
  }

  return 'light'
}

function applyNativeTheme(context: UniAppContext, theme: UniResolvedTheme) {
  const tokens = context.config.themeRuntime?.tokens

  if (!tokens) {
    return
  }

  const palette = createUniTheme(tokens)[theme]

  uni.setBackgroundColor?.({
    backgroundColor: palette.bgColor,
    backgroundColorTop: palette.bgColorTop,
    backgroundColorBottom: palette.bgColorBottom,
  })

  uni.setNavigationBarColor?.({
    frontColor: palette.navTxtStyle === 'white' ? '#ffffff' : '#000000',
    backgroundColor: palette.navBgColor,
    animation: {
      duration: 0,
      timingFunc: 'linear',
    },
  })
}

export function installNativeThemeRuntime(context: UniAppContext) {
  const options = context.config.themeRuntime

  if (!options?.tokens) {
    return
  }

  const configuredMode = options.mode || 'system'
  const pinia = context.pinia as Parameters<typeof useThemeStore>[0] | undefined

  if (pinia && configuredMode !== 'system') {
    useThemeStore(pinia).setThemePreference(configuredMode)
  }

  options.onSystemThemeChange?.(resolveSystemThemeSync(), context)

  if (typeof options.getTheme === 'function') {
    watch(() => options.getTheme?.(context) || 'light', (theme) => {
      applyNativeTheme(context, theme === 'dark' ? 'dark' : 'light')
    }, {
      immediate: true,
    })
  }
  else {
    applyNativeTheme(context, resolveSystemThemeSync())
  }

  uni.onThemeChange?.(({ theme }) => {
    const resolvedTheme = theme === 'dark' ? 'dark' : 'light'
    options.onSystemThemeChange?.(resolvedTheme, context)

    if (typeof options.getTheme !== 'function') {
      applyNativeTheme(context, resolvedTheme)
    }
  })
}
