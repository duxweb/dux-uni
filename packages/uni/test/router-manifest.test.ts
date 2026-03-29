import { describe, expect, it } from 'vitest'
import { createDuxRouterManifest, defineDuxConfig } from '../src'

describe('router manifest', () => {
  it('marks configured tabBar pages even when source pages only declare tabBarIcon', () => {
    const config = defineDuxConfig({
      app: {
        name: 'starter',
        title: 'Starter',
      },
      router: {
        home: 'home',
        login: 'auth.login',
        tabBar: ['home', 'feature', 'account'],
      },
      modules: [],
    })

    const pages = [
      {
        title: '首页',
        tabBarIcon: {
          iconPath: 'static/tabbar/home.svg',
          selectedIconPath: 'static/tabbar/home-active.svg',
        },
        path: '/pages/home/index',
        module: 'home',
        name: 'home.index',
      },
      {
        title: '功能',
        tabBarIcon: {
          iconPath: 'static/tabbar/feature.svg',
          selectedIconPath: 'static/tabbar/feature-active.svg',
        },
        path: '/pages/feature/index',
        module: 'feature',
        name: 'feature.index',
      },
      {
        title: '账户',
        tabBarIcon: {
          iconPath: 'static/tabbar/account.svg',
          selectedIconPath: 'static/tabbar/account-active.svg',
        },
        path: '/pages/account/index',
        module: 'account',
        name: 'account.index',
      },
      {
        title: '登录',
        path: '/pages/auth/login',
        module: 'auth',
        name: 'auth.login',
      },
    ]

    const manifest = createDuxRouterManifest(config, pages)

    expect(manifest.pagesByName['home.index']?.tabBar).toEqual({ mode: 'custom' })
    expect(manifest.pagesByName['feature.index']?.tabBar).toEqual({ mode: 'custom' })
    expect(manifest.pagesByName['account.index']?.tabBar).toEqual({ mode: 'custom' })
    expect(manifest.tabBarPages.map(page => page.name)).toEqual(['home.index', 'feature.index', 'account.index'])
  })
})
