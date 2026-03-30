import { describe, expect, it } from 'vitest'
import { createDuxRouterManifest, createUniTabBar, defineDuxConfig } from '../src'

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

    expect(manifest.pagesByName['home.index']?.tabBar).toEqual({ mode: 'native', renderer: 'native' })
    expect(manifest.pagesByName['feature.index']?.tabBar).toEqual({ mode: 'native', renderer: 'native' })
    expect(manifest.pagesByName['account.index']?.tabBar).toEqual({ mode: 'native', renderer: 'native' })
    expect(manifest.tabBarPages.map(page => page.name)).toEqual(['home.index', 'feature.index', 'account.index'])
  })

  it('omits native tabbar icons when renderer is custom', () => {
    const config = defineDuxConfig({
      app: {
        name: 'starter',
        title: 'Starter',
      },
      router: {
        home: 'home',
        login: 'auth.login',
        tabBar: ['home', 'feature', 'account'],
        tabBarMode: 'native',
        tabBarRenderer: 'custom',
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

    const tabBar = createUniTabBar(config, pages)

    expect(tabBar?.list).toEqual([
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/feature/index',
        text: '功能',
      },
      {
        pagePath: 'pages/account/index',
        text: '账户',
      },
    ])
  })
})
