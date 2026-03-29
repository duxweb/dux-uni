import {
  OVERLAY_REGISTRY_COMPONENT_NAME,
  createUni,
  defineUniConfig,
  resolveDuxConfig,
  simpleAuthProvider,
  simpleDataProvider,
} from '@duxweb/uni'
import { createMockRequestAdapter } from './demo/mockApi'
import duxConfig from './dux.config'
import { generatedSchemaComponents } from './runtime/generated/schema-components'
import { routerManifest } from './runtime/router/manifest'

// App runtime singleton: request, router, auth, session, actions, and modules all mount here.
const config = resolveDuxConfig(duxConfig)
const homePage = routerManifest.homePage
const loginPage = routerManifest.loginPage

export const dux = createUni(defineUniConfig({
  ...config.runtime,
  appName: config.app.name,
  overlayRegistry: OVERLAY_REGISTRY_COMPONENT_NAME,
  tabBarMode: routerManifest.config.router.tabBarMode,
  pages: routerManifest.pages,
  modules: config.modules,
  schema: {
    components: generatedSchemaComponents,
  },
  permission: {
    redirectTo: '/pages/system/forbidden/index',
  },
  request: {
    adapter: createMockRequestAdapter(),
  },
  authProvider: simpleAuthProvider({
    path: {
      login: '/login',
      check: '/check',
      logout: '/logout',
    },
    route: {
      login: loginPage?.path || '/pages/auth/login',
      index: homePage?.path || '/pages/home/index',
    },
  }),
  dataProvider: simpleDataProvider(),
}))

dux.actions.register('logout', async () => {
  const result = await dux.config.authProvider?.logout({}, dux)
  await dux.session.clear()
  await dux.navigator.reLaunch(result?.redirectTo || loginPage?.path || '/pages/auth/login')
})

dux.actions.register('toast', async ({ payload }) => {
  if (typeof payload === 'string') {
    uni.showToast({
      title: payload,
      icon: 'none',
    })
    return
  }

  if (payload && typeof payload === 'object') {
    const input = payload as {
      title?: string
      msg?: string
      message?: string
      icon?: 'success' | 'error' | 'loading' | 'none'
      duration?: number
    }

    uni.showToast({
      title: input.title || input.msg || input.message || '',
      icon: input.icon || 'none',
      duration: input.duration,
    })
    return
  }

  uni.showToast({
    title: '操作成功',
    icon: 'none',
  })
})
