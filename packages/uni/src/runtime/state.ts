import type { UniAppContext } from '../types'
import { useAuthStore } from '../stores/auth'
import { useSessionStore } from '../stores/session'

export function getRuntimeStores(app: UniAppContext) {
  const pinia = app.pinia as Parameters<typeof useAuthStore>[0] | undefined
  if (!pinia) {
    return null
  }

  return {
    authStore: useAuthStore(pinia),
    sessionStore: useSessionStore(pinia),
  }
}

export function syncRuntimeStores(app: UniAppContext) {
  const stores = getRuntimeStores(app)
  if (!stores) {
    return
  }

  const auth = app.session.getAuth()

  stores.authStore.setAuth(auth)
  stores.sessionStore.setState({
    initialized: true,
    authenticated: Boolean(auth?.token),
  })
}
