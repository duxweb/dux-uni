import { defineDuxConfig } from '@duxweb/uni'
import { duxModules } from './runtime/generated/modules'

export default defineDuxConfig({
  app: {
    name: 'template',
    title: 'Dux Uni Template',
    description: 'Dux Uni 模块化模板',
  },
  router: {
    home: 'home.index',
    login: '/pages/auth/login',
    tabBar: ['home', 'account'],
  },
  ui: {
    theme: 'light',
    tokens: {
      primary: '#0f766e',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
      background: '#f6fbfa',
      backgroundMuted: '#e6f6f3',
      chrome: '#ffffff',
      surface: '#ffffff',
      surfaceMuted: '#ecfdf5',
      text: '#0f172a',
      textSecondary: '#5b6b7b',
      border: '#d7e5e1',
      navBackground: '#ffffff',
      navText: 'black',
      tabBackground: '#ffffff',
      tabColor: '#94a3b8',
      tabSelectedColor: '#0f766e',
      pageGradientFrom: '#f4fbfa',
      pageGradientTo: '#e2f5f1',
    },
    radius: {
      card: '24rpx',
      button: '18rpx',
      shell: '30rpx',
    },
    spacing: {
      page: '24rpx',
      section: '24rpx',
      gap: '18rpx',
      bottomInset: '42rpx',
    },
  },
  runtime: {
    storageKey: '@duxweb/uni/template/session',
  },
  extraPages: [],
  modules: duxModules,
})
