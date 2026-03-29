import { createUni, definePageMeta, defineUniConfig, simpleAuthProvider, simpleDataProvider } from '@duxweb/uni'

const pages = [
  definePageMeta({
    name: 'index',
    path: '/pages/index/index',
    auth: true,
    title: 'Home',
  }),
  definePageMeta({
    name: 'login',
    path: '/pages/login/index',
    auth: false,
    title: 'Login',
  }),
]

export const unix = createUni(defineUniConfig({
  appName: 'starter',
  apiBaseURL: 'https://api.example.com',
  pages,
  authProvider: simpleAuthProvider({
    route: {
      login: '/pages/login/index',
      index: '/pages/index/index',
    },
  }),
  dataProvider: simpleDataProvider(),
}))
