import type { UniAppContext, UniAuthRequestOptions } from '../types'
import { simpleAuthProvider } from '../providers/auth'
import { removeUniQueries } from './query'
import { syncRuntimeStores } from './state'

const DEFAULT_AUTH_CHECK_TTL = 5 * 60 * 1000

interface AuthLifecycleState {
  running?: Promise<void>
  lastCheckedAt: number
}

const authLifecycleState = new WeakMap<UniAppContext, AuthLifecycleState>()

function getAuthLifecycleState(app: UniAppContext) {
  let state = authLifecycleState.get(app)
  if (!state) {
    state = {
      lastCheckedAt: 0,
    }
    authLifecycleState.set(app, state)
  }
  return state
}

function resolveCheckOptions(app: UniAppContext): UniAuthRequestOptions | undefined {
  const path = app.config.auth?.path
  const method = app.config.auth?.method
  if (!path && !method) {
    return undefined
  }
  return {
    path,
    method,
  }
}

function getCheckTtl(app: UniAppContext) {
  return typeof app.config.auth?.checkTtl === 'number'
    ? app.config.auth.checkTtl
    : DEFAULT_AUTH_CHECK_TTL
}

async function runAuthCheck(app: UniAppContext, source: 'launch' | 'show') {
  const provider = app.config.authProvider || simpleAuthProvider()
  const requestOptions = resolveCheckOptions(app)
  const currentAuth = app.session.getAuth()

  try {
    const result = await provider.check?.(undefined, app, currentAuth, requestOptions) || {
      success: Boolean(currentAuth?.token),
      logout: !currentAuth?.token,
      data: currentAuth || undefined,
    }

    if (result.success) {
      if (result.data) {
        await app.session.setAuth(result.data)
      }
      syncRuntimeStores(app)
      app.events.emit('auth:check-success', {
        result,
        source,
      })
      return
    }

    if (result.logout) {
      await app.session.clear()
      syncRuntimeStores(app)
      await removeUniQueries(app)
      app.events.emit('auth:check-logout', {
        result,
        source,
      })
      return
    }

    app.events.emit('auth:check-failed', {
      result,
      source,
    })
  }
  catch (error) {
    app.events.emit('auth:check-error', {
      error,
      source,
    })
  }
}

async function runAuthLifecycleCheck(app: UniAppContext, source: 'launch' | 'show') {
  const state = getAuthLifecycleState(app)
  if (state.running) {
    return await state.running
  }

  state.lastCheckedAt = Date.now()
  state.running = runAuthCheck(app, source).finally(() => {
    state.running = undefined
  })

  return await state.running
}

export async function runAuthCheckOnLaunch(app: UniAppContext) {
  await app.ready
  if (app.config.auth?.autoCheckOnLaunch === false) {
    return
  }
  if (!app.session.isAuthenticated()) {
    return
  }
  await runAuthLifecycleCheck(app, 'launch')
}

export async function runAuthCheckOnShow(app: UniAppContext) {
  await app.ready
  if (app.config.auth?.autoCheckOnShow === false) {
    return
  }
  if (!app.session.isAuthenticated()) {
    return
  }

  const ttl = getCheckTtl(app)
  const state = getAuthLifecycleState(app)
  if (ttl > 0 && state.lastCheckedAt > 0 && Date.now() - state.lastCheckedAt < ttl) {
    return
  }

  await runAuthLifecycleCheck(app, 'show')
}
