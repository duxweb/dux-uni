import { defineUniModule } from '@duxweb/uni'

export const accountModule = defineUniModule({
  name: 'account',
  defaultLayout: 'home',
  register({ hooks }) {
    hooks.tap('auth.login.methods', () => ({
      key: 'sso',
      label: '企业 SSO',
      description: '由 account 模块注入的登录方式扩展示例',
    }))
  },
})
