import type { MaybeRef } from 'vue'
import type { UniAppContext } from '../types'
import { onShow } from '@dcloudio/uni-app'
import { ref, unref } from 'vue'
import { resolveHookAppOptions } from './shared'

export interface UsePageGuardOptions {
  mode?: 'auth' | 'guest'
  loginPath?: MaybeRef<string | undefined>
  indexPath?: MaybeRef<string | undefined>
}

export function usePageGuard(appOrOptions?: UniAppContext | UsePageGuardOptions, maybeOptions: UsePageGuardOptions = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const ready = ref(false)

  onShow(async () => {
    await app.ready
    const authenticated = app.session.isAuthenticated()
    const loginPath = unref(options.loginPath)
      || app.router.getPageByName('login')?.path
      || app.router.getPageByPath('/pages/auth/login')?.path
      || '/pages/auth/login'
    const indexPath = unref(options.indexPath)
      || app.router.getPageByName('index')?.path
      || app.router.getPageByPath('/pages/home/index')?.path
      || app.router.getPagesByModule('home').find(page => page.path === '/pages/home/index')?.path
      || app.router.pages[0]?.path
      || '/pages/home/index'
    const mode = options.mode || 'auth'

    if (mode === 'auth' && !authenticated) {
      await app.navigator.reLaunch(loginPath)
      return
    }

    if (mode === 'guest' && authenticated) {
      await app.navigator.reLaunch(indexPath)
      return
    }

    ready.value = true
  })

  return {
    ready,
  }
}
