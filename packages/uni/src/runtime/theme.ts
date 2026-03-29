import type { Dict, UniAppContext } from '../types'
import { watch } from 'vue'
import { createUniTheme } from '../dux/theme'

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

  const palette = createUniTheme(tokens as Dict<string>)[theme]

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
