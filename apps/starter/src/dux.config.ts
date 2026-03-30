import { defineDuxConfig } from '@duxweb/uni'
import { duxModules } from './runtime/generated/modules'

export default defineDuxConfig({
  app: {
    name: 'starter',
    title: 'Dux Uni Starter',
    description: 'Dux Uni 演示应用',
  },
  router: {
    home: 'home',
    login: 'auth.login',
    tabBar: ['home', 'feature', 'account'],
    tabBarMode: 'native',
    tabBarRenderer: 'custom',
  },
  ui: {
    theme: 'auto',
    navigationStyle: 'custom',
    schemaComponents: ['wd-button', 'wd-input'],
    tokens: {
      primary: '#059669',
      info: '#0ea5e9',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      neutral: '#71717a',
      background: '#fafafa',
      backgroundMuted: '#f5f5f5',
      chrome: '#ffffff',
      surface: '#ffffff',
      surfaceMuted: '#f5f5f5',
      text: '#18181b',
      navBackground: '#ffffff',
      navText: 'black',
      tabBackground: '#ffffff',
      tabColor: '#a1a1aa',
      tabSelectedColor: '#059669',
      pageGradientFrom: '#fafafa',
      pageGradientTo: '#f5f5f5',
    },
    radius: {
      card: '24rpx',
      button: '18rpx',
      shell: '32rpx',
    },
    spacing: {
      page: '24rpx',
      section: '24rpx',
      gap: '18rpx',
      bottomInset: '42rpx',
    },
  },
  runtime: {
    apiBaseURL: 'https://demo.local/api',
    storageKey: '@duxweb/uni/starter/session',
  },
  extraPages: [],
  modules: duxModules,
})
