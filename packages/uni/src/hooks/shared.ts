import type { Dict, UniAppContext, UniDataProvider } from '../types'
import { computed, unref } from 'vue'
import { useUniApp } from '../app/install'

export function getDataProvider(app: UniAppContext): UniDataProvider {
  const provider = app.config.dataProvider
  if (!provider) {
    throw new Error('No data provider is configured for the current app')
  }
  return provider
}

export function resolveResourceUrl(app: UniAppContext, input: {
  path?: string
  url?: string
}) {
  if (input.url) {
    return input.url
  }

  if (!input.path) {
    throw new Error('A path or url is required')
  }

  const provider = app.config.dataProvider
  return provider?.apiUrl?.(input.path, app.config.apiBasePath) || input.path
}

export function withAuthHeaders(app: UniAppContext, headers?: Dict<string>) {
  const token = app.session?.getAuth?.()?.token
  if (!token) {
    return headers
  }
  return {
    ...(headers || {}),
    Authorization: token,
  }
}

export function useResolvedRecord<T extends Dict>(value: T | (() => T) | undefined) {
  return computed(() => {
    const resolved = typeof value === 'function' ? value() : unref(value as any)
    return (resolved || {}) as T
  })
}

export function isUniAppContext(value: unknown): value is UniAppContext {
  return Boolean(
    value
    && typeof value === 'object'
    && 'config' in (value as Record<string, unknown>)
    && 'navigator' in (value as Record<string, unknown>)
    && 'router' in (value as Record<string, unknown>)
    && 'queryClient' in (value as Record<string, unknown>),
  )
}

function isHookAppCandidate(value: unknown): value is Partial<UniAppContext> {
  return Boolean(
    value
    && typeof value === 'object'
    && (
      'config' in (value as Record<string, unknown>)
      || 'session' in (value as Record<string, unknown>)
      || 'queryClient' in (value as Record<string, unknown>)
    ),
  )
}

export function resolveHookAppOptions<T>(
  appOrOptions: UniAppContext | T | undefined,
  maybeOptions?: T,
) {
  if (isUniAppContext(appOrOptions)) {
    return {
      app: appOrOptions,
      options: maybeOptions,
    }
  }

  if (typeof maybeOptions !== 'undefined' && isHookAppCandidate(appOrOptions)) {
    return {
      app: appOrOptions as UniAppContext,
      options: maybeOptions,
    }
  }

  return {
    app: useUniApp(),
    options: appOrOptions,
  }
}

export function resolveHookAppValue<T>(
  appOrValue: UniAppContext | T,
  maybeValue?: T,
) {
  if (isUniAppContext(appOrValue)) {
    return {
      app: appOrValue,
      value: maybeValue as T,
    }
  }

  if (typeof maybeValue !== 'undefined' && isHookAppCandidate(appOrValue)) {
    return {
      app: appOrValue as UniAppContext,
      value: maybeValue as T,
    }
  }

  return {
    app: useUniApp(),
    value: appOrValue as T,
  }
}
