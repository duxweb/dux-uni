import type { UniAppContext } from '../types'
import { onShow } from '@dcloudio/uni-app'
import { toValue, watch } from 'vue'
import { useUniApp } from '../app/install'
import { useAppStore } from '../stores/app'

export interface UsePageTitleOptions {
  app?: UniAppContext
  immediate?: boolean
}

export function usePageTitle(
  title: unknown,
  options: UsePageTitleOptions = {},
) {
  const app = options.app || useUniApp()
  const appStore = app.pinia ? useAppStore(app.pinia as never) : null

  function resolveCurrentPath() {
    const stack = getCurrentPages()
    const current = stack[stack.length - 1] as { route?: string } | undefined
    const path = String(current?.route || '')
    return path ? (path.startsWith('/') ? path : `/${path}`) : ''
  }

  const apply = async () => {
    const value = toValue(title)
    if (!value) {
      return
    }
    appStore?.setPageTitle({
      title: String(value),
      path: resolveCurrentPath(),
    })
    await app.navigator.setTitle(String(value))
  }

  watch(() => toValue(title), () => {
    void apply()
  }, {
    immediate: options.immediate !== false,
  })

  onShow(() => {
    void apply()
  })

  return {
    setTitle(value: string) {
      return app.navigator.setTitle(value)
    },
  }
}
