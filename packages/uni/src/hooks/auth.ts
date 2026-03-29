import type { UseMutationOptions as VueUseMutationOptions } from '@tanstack/vue-query'
import type { ComputedRef, MaybeRef } from 'vue'
import type {
  Dict,
  UniAppContext,
  UniAuthRequestOptions,
  UniAuthState,
  UniCheckResult,
  UniLoginResult,
  UniLogoutResult,
} from '../types'
import { useMutation as useVueMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue'
import { removeUniQueries } from '../runtime/query'
import { getRuntimeStores, syncRuntimeStores } from '../runtime/state'
import { simpleAuthProvider } from '../providers/auth'
import { resolveHookAppOptions, resolveHookAppValue } from './shared'

export interface UniAuthActionError<T> extends Error {
  result: T
}

type MutationConfig<TResult, TVariables> = Omit<
  VueUseMutationOptions<TResult, UniAuthActionError<TResult>, TVariables>,
  'mutationFn'
>

function createAuthError<T extends { message?: string }>(result: T, fallback: string) {
  const error = new Error(result.message || fallback) as UniAuthActionError<T>
  error.result = result
  return error
}

async function updateAuthState(app: UniAppContext, auth: UniAuthState | null) {
  await app.session.setAuth(auth)
  syncRuntimeStores(app)
}

async function clearAuthState(app: UniAppContext) {
  await app.session.clear()
  syncRuntimeStores(app)
  await removeUniQueries(app)
}

export interface UseLoginOptions {
  redirectTo?: MaybeRef<string | undefined>
  path?: MaybeRef<string | undefined>
  method?: MaybeRef<string | undefined>
  mutationOptions?: MutationConfig<UniLoginResult, Dict>
}

export interface UseLogoutOptions {
  redirectTo?: MaybeRef<string | undefined>
  path?: MaybeRef<string | undefined>
  method?: MaybeRef<string | undefined>
  mutationOptions?: MutationConfig<UniLogoutResult, Dict | undefined>
}

export interface UseCheckOptions {
  path?: MaybeRef<string | undefined>
  method?: MaybeRef<string | undefined>
  mutationOptions?: MutationConfig<UniCheckResult, Dict | undefined>
}

function resolveAuthRequestOptions(options: {
  path?: MaybeRef<string | undefined>
  method?: MaybeRef<string | undefined>
}): UniAuthRequestOptions | undefined {
  const path = unref(options.path)
  const method = unref(options.method)
  if (!path && !method) {
    return undefined
  }
  return {
    path,
    method,
  }
}

export function useLogin(appOrOptions?: UniAppContext | UseLoginOptions, maybeOptions: UseLoginOptions = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  syncRuntimeStores(app)
  const provider = app.config.authProvider || simpleAuthProvider()

  const mutation = useVueMutation({
    mutationFn: async (params: Dict) => {
      await app.ready
      const result = await provider.login(params, app, resolveAuthRequestOptions(options))
      if (!result.success || !result.data) {
        throw createAuthError(result, 'Login failed')
      }

      await updateAuthState(app, result.data)
      await removeUniQueries(app)
      app.events.emit('auth:login-success', {
        auth: result.data,
        params,
        result,
      })

      const redirectTo = unref(options.redirectTo) || result.redirectTo
      if (redirectTo) {
        await app.navigator.reLaunch(redirectTo)
      }

      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    login: mutation.mutateAsync,
  }
}

export function useLogout(appOrOptions?: UniAppContext | UseLogoutOptions, maybeOptions: UseLogoutOptions = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  syncRuntimeStores(app)
  const provider = app.config.authProvider || simpleAuthProvider()

  const mutation = useVueMutation({
    mutationFn: async (params?: Dict) => {
      await app.ready
      const result = await provider.logout(params, app, resolveAuthRequestOptions(options))
      if (!result.success) {
        throw createAuthError(result, 'Logout failed')
      }

      await clearAuthState(app)
      app.events.emit('auth:logout', {
        params,
        result,
      })

      const redirectTo = unref(options.redirectTo) || result.redirectTo
      if (redirectTo) {
        await app.navigator.reLaunch(redirectTo)
      }

      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    logout: mutation.mutateAsync,
  }
}

export function useCheck(appOrOptions?: UniAppContext | UseCheckOptions, maybeOptions: UseCheckOptions = {}) {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  syncRuntimeStores(app)
  const provider = app.config.authProvider || simpleAuthProvider()

  const mutation = useVueMutation({
    mutationFn: async (params?: Dict) => {
      await app.ready
      const result = await provider.check?.(params, app, app.session.getAuth(), resolveAuthRequestOptions(options)) || {
        success: app.session.isAuthenticated(),
        logout: !app.session.isAuthenticated(),
        data: app.session.getAuth() || undefined,
      }

      if (result.success) {
        if (result.data) {
          await updateAuthState(app, result.data)
        }
        else {
          syncRuntimeStores(app)
        }
        app.events.emit('auth:check-success', {
          params,
          result,
        })
        return result
      }

      if (result.logout) {
        await clearAuthState(app)
        app.events.emit('auth:check-logout', {
          params,
          result,
        })
      }

      return result
    },
    ...(options.mutationOptions || {}),
  }, app.queryClient)

  return {
    ...mutation,
    check: mutation.mutateAsync,
  }
}

/**
 * @deprecated Prefer `useAuth()` and derive login state from `auth.value?.token`.
 */
export function useIsLogin(appOrNothing?: UniAppContext): ComputedRef<boolean> {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)
  syncRuntimeStores(app)
  const stores = getRuntimeStores(app)
  return computed(() => stores?.sessionStore.authenticated ?? app.session.isAuthenticated())
}

export function useCan(
  appOrPermission: UniAppContext | MaybeRef<string | undefined>,
  maybePermission?: MaybeRef<string | undefined>,
): ComputedRef<boolean> {
  const { app, value: permission } = resolveHookAppValue(appOrPermission, maybePermission)
  syncRuntimeStores(app)
  const provider = app.config.authProvider || simpleAuthProvider()
  const stores = getRuntimeStores(app)

  return computed(() => {
    const currentPermission = unref(permission)
    if (!currentPermission) {
      return true
    }
    return provider.can?.(currentPermission, app, stores?.authStore.auth ?? app.session.getAuth()) ?? true
  })
}
