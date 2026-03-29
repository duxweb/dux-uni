import type { ComputedRef } from 'vue'
import type {
  Dict,
  UniAppContext,
  UniSseMessage,
  UniSseOpenResult,
  UniSseRetryContext,
  UniSseStatus,
  UniSseTransportMode,
} from '../types'
import { computed, getCurrentScope, onScopeDispose, ref, shallowRef } from 'vue'
import { createEventSourceUrl, defaultEventSourceExecutor } from '../runtime/sse'
import type { UniSseExecutorInput } from '../runtime/sse'
import { resolveHookAppOptions, resolveResourceUrl, withAuthHeaders } from './shared'

export interface UniEventSourceMessage<T = unknown> extends UniSseMessage {
  parsed?: T
}

export function parseSseJson<T = unknown>(input: string): T | undefined {
  try {
    return JSON.parse(input) as T
  }
  catch {
    return undefined
  }
}

function digSseText(payload: unknown): string | undefined {
  if (typeof payload === 'string') {
    return payload
  }
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const record = payload as Record<string, unknown>
  const direct = ['text', 'content', 'delta']
    .map(key => record[key])
    .find(value => typeof value === 'string')
  if (typeof direct === 'string') {
    return direct
  }

  const choices = Array.isArray(record.choices) ? record.choices[0] : undefined
  if (choices && typeof choices === 'object') {
    const choiceRecord = choices as Record<string, unknown>
    const delta = choiceRecord.delta
    if (delta && typeof delta === 'object' && typeof (delta as Record<string, unknown>).content === 'string') {
      return String((delta as Record<string, unknown>).content)
    }
    if (typeof choiceRecord.text === 'string') {
      return choiceRecord.text
    }
    const message = choiceRecord.message
    if (message && typeof message === 'object' && typeof (message as Record<string, unknown>).content === 'string') {
      return String((message as Record<string, unknown>).content)
    }
  }

  return undefined
}

export function resolveSseText(input: unknown, fallback = '') {
  const text = digSseText(input)
  return typeof text === 'string' ? text : fallback
}

export interface UseEventSourceOptions<T = unknown> {
  path?: string
  url?: string
  query?: Dict
  method?: string
  body?: unknown
  headers?: Dict<string>
  withAuth?: boolean
  immediate?: boolean
  timeout?: number
  heartbeatTimeout?: number
  maxRetryCount?: number
  retryDelay?: number
  transport?: UniSseTransportMode
  parse?: (message: UniSseMessage) => T | undefined
  executor?: (input: UniSseExecutorInput) => Promise<void>
  onOpen?: (result: UniSseOpenResult) => void
  onMessage?: (message: UniEventSourceMessage<T>) => void
  onRetry?: (context: UniSseRetryContext) => void
  onError?: (error: unknown) => void
  onFinish?: () => void
}

export interface UseEventSourceReturn<T = unknown> {
  status: ComputedRef<UniSseStatus>
  connecting: ComputedRef<boolean>
  streaming: ComputedRef<boolean>
  retrying: ComputedRef<boolean>
  retryCount: ComputedRef<number>
  openResult: ComputedRef<UniSseOpenResult | undefined>
  messages: ComputedRef<UniEventSourceMessage<T>[]>
  lastMessage: ComputedRef<UniEventSourceMessage<T> | undefined>
  text: ComputedRef<string>
  error: ComputedRef<unknown>
  connect: (override?: Partial<UseEventSourceOptions<T>>) => Promise<void>
  close: () => void
  reset: () => void
}

export function useEventSource<T = unknown>(
  appOrOptions?: UniAppContext | UseEventSourceOptions<T>,
  maybeOptions: UseEventSourceOptions<T> = {},
): UseEventSourceReturn<T> {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const status = ref<UniSseStatus>('idle')
  const retryCount = ref(0)
  const openResult = shallowRef<UniSseOpenResult>()
  const messages = shallowRef<UniEventSourceMessage<T>[]>([])
  const text = ref('')
  const error = shallowRef<unknown>()
  const controller = ref<AbortController>()

  function reset() {
    retryCount.value = 0
    openResult.value = undefined
    messages.value = []
    text.value = ''
    error.value = undefined
  }

  function close() {
    controller.value?.abort()
    controller.value = undefined
    status.value = 'closed'
  }

  async function connect(override: Partial<UseEventSourceOptions<T>> = {}) {
    close()
    reset()

    const nextOptions = {
      ...options,
      ...override,
    }

    status.value = 'connecting'
    const abortController = new AbortController()
    controller.value = abortController

    const headers = nextOptions.withAuth === false
      ? nextOptions.headers
      : withAuthHeaders(app, nextOptions.headers)

    const executor = nextOptions.executor || defaultEventSourceExecutor
    const targetUrl = createEventSourceUrl(resolveResourceUrl(app, {
      path: nextOptions.path,
      url: nextOptions.url,
    }), nextOptions.query)

    try {
      await executor({
        url: targetUrl,
        method: nextOptions.method,
        headers,
        body: nextOptions.body,
        timeout: nextOptions.timeout,
        heartbeatTimeout: nextOptions.heartbeatTimeout,
        maxRetryCount: nextOptions.maxRetryCount,
        retryDelay: nextOptions.retryDelay,
        transport: nextOptions.transport,
        signal: abortController.signal,
        onOpen(result) {
          openResult.value = result
          status.value = 'open'
          nextOptions.onOpen?.(result)
        },
        onMessage(message) {
          const entry: UniEventSourceMessage<T> = {
            ...message,
            ...(nextOptions.parse ? { parsed: nextOptions.parse(message) } : {}),
          }
          messages.value = [...messages.value, entry]
          text.value += resolveSseText(entry.parsed, message.data)
          nextOptions.onMessage?.(entry)
        },
        onRetry(context) {
          retryCount.value = context.attempt
          status.value = 'retrying'
          nextOptions.onRetry?.(context)
        },
        onError(reason) {
          error.value = reason
          nextOptions.onError?.(reason)
        },
        onFinish() {
          status.value = 'closed'
          nextOptions.onFinish?.()
        },
      })

      if (controller.value === abortController) {
        controller.value = undefined
      }
      if (!abortController.signal.aborted) {
        status.value = 'closed'
      }
    }
    catch (reason) {
      if (abortController.signal.aborted) {
        status.value = 'closed'
        return
      }
      error.value = reason
      status.value = 'error'
      throw reason
    }
  }

  if (options.immediate) {
    void connect()
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      close()
    })
  }

  return {
    status: computed(() => status.value),
    connecting: computed(() => status.value === 'connecting'),
    streaming: computed(() => status.value === 'open'),
    retrying: computed(() => status.value === 'retrying'),
    retryCount: computed(() => retryCount.value),
    openResult: computed(() => openResult.value),
    messages: computed(() => messages.value),
    lastMessage: computed(() => messages.value[messages.value.length - 1]),
    text: computed(() => text.value),
    error: computed(() => error.value),
    connect,
    close,
    reset,
  }
}

export function useSSE<T = unknown>(
  appOrOptions?: UniAppContext | UseEventSourceOptions<T>,
  maybeOptions: UseEventSourceOptions<T> = {},
) {
  return useEventSource<T>(appOrOptions as any, maybeOptions)
}
