import type { Dict, UniAuthProvider } from '@duxweb/uni'
import { createUni, defineUniConfig, resolveDuxConfig } from '@duxweb/uni'
import duxConfig from './dux.config'
import { routerManifest } from './runtime/router/manifest'

// App runtime singleton: request, router, auth, session, actions, and modules all mount here.
const config = resolveDuxConfig(duxConfig)
const homePage = routerManifest.homePage
const loginPage = routerManifest.loginPage

const authProvider: UniAuthProvider = {
  async login(params) {
    const username = String((params as Dict).username || '')
    const password = String((params as Dict).password || '')

    if (username !== 'admin' || password !== 'admin123') {
      return {
        success: false,
        message: '账号或密码错误',
      }
    }

    return {
      success: true,
      redirectTo: homePage?.path || '/pages/home/index',
      data: {
        token: 'template-admin-token',
        user: {
          name: '模板管理员',
          role: 'admin',
        },
        permissions: ['home.view', 'account.view'],
      },
    }
  },
  async logout() {
    return {
      success: true,
      redirectTo: loginPage?.path || '/pages/auth/login',
    }
  },
  async check(_params, _context, auth) {
    if (!auth?.token) {
      return {
        success: false,
        logout: true,
        message: '请先登录',
      }
    }

    return {
      success: true,
      data: auth,
    }
  },
  can(permission, _context, auth) {
    const permissions = auth?.permissions
    if (Array.isArray(permissions)) {
      return permissions.includes(permission)
    }
    return true
  },
}

export const dux = createUni(defineUniConfig({
  ...config.runtime,
  appName: config.app.name,
  tabBarMode: routerManifest.config.router.tabBarMode,
  pages: routerManifest.pages,
  modules: config.modules,
  permission: {
    redirectTo: '/pages/system/forbidden/index',
  },
  authProvider,
}))
