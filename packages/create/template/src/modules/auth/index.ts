import { defineUniModule } from '@duxweb/uni'

function resolveLoginPath(app: Parameters<NonNullable<Parameters<typeof defineUniModule>[0]['middlewares']>[number]['handler']>[0]['app']) {
  return app.router.getPageByName('login')?.path
    || app.router.getPageByPath('/pages/auth/login')?.path
    || '/pages/auth/login'
}

function resolveHomePath(app: Parameters<NonNullable<Parameters<typeof defineUniModule>[0]['middlewares']>[number]['handler']>[0]['app']) {
  return app.router.getPageByName('index')?.path
    || app.router.getPageByPath('/pages/home/index')?.path
    || app.router.getPagesByModule('home').find(page => page.path === '/pages/home/index')?.path
    || '/pages/home/index'
}

export const authModule = defineUniModule({
  name: 'auth',
  defaultLayout: 'default',
  middlewares: [
    {
      name: 'auth',
      handler({ app, to }) {
        if (app.session.isAuthenticated()) {
          return
        }
        const loginPath = resolveLoginPath(app)
        if (to?.path === loginPath) {
          return
        }
        return loginPath
      },
    },
    {
      name: 'guest',
      handler({ app }) {
        if (!app.session.isAuthenticated()) {
          return
        }
        return resolveHomePath(app)
      },
    },
  ],
})
