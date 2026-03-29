import type {
  Dict,
  UniSseMessage,
  UniSseOpenResult,
  UniSseRetryContext,
  UniSseTransportMode,
} from '../types'

const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_TIMEOUT = 300000
const DEFAULT_HEARTBEAT_TIMEOUT = 120000
const DEFAULT_MAX_RETRY_COUNT = 5

type UniSseChunk = string | Uint8Array | ArrayBuffer

interface UniSseTransportOptions {
  url: string
  method: string
  headers?: Dict<string>
  body?: unknown
  signal?: AbortSignal
  onOpen?: (result: UniSseOpenResult) => void
  onChunk: (chunk: UniSseChunk) => void
  onError: (error: unknown) => void
  onComplete: () => void
}

interface UniSseConnection {
  abort: () => void
}

export interface UniSseExecutorInput {
  url: string
  method?: string
  headers?: Dict<string>
  body?: unknown
  timeout?: number
  heartbeatTimeout?: number
  maxRetryCount?: number
  retryDelay?: number
  transport?: UniSseTransportMode
  signal?: AbortSignal
  onOpen?: (result: UniSseOpenResult) => void
  onMessage?: (message: UniSseMessage) => void
  onError?: (error: unknown) => void
  onFinish?: () => void
  onRetry?: (context: UniSseRetryContext) => void
}

function asError(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason : new Error(String(reason || fallback))
}

function isPlainObject(value: unknown) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function normalizeMethod(value?: string) {
  return String(value || 'GET').toUpperCase()
}

function serializeQuery(query?: Dict) {
  if (!query) {
    return ''
  }

  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

export function createEventSourceUrl(url: string, query?: Dict) {
  const search = serializeQuery(query)
  if (!search) {
    return url
  }
  return `${url}${url.includes('?') ? '&' : '?'}${search}`
}

function normalizeHeaders(headers?: Dict<string>) {
  return {
    Accept: 'text/event-stream',
    ...(headers || {}),
  }
}

function normalizeFetchBody(method: string, headers: Dict<string>, body: unknown) {
  if (!body || method === 'GET' || method === 'HEAD') {
    return {
      headers,
      body: undefined,
    }
  }

  if (
    typeof body === 'string'
    || body instanceof ArrayBuffer
    || body instanceof Blob
    || body instanceof FormData
    || (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
  ) {
    return {
      headers,
      body,
    }
  }

  if (isPlainObject(body) && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  return {
    headers,
    body: isPlainObject(body) ? JSON.stringify(body) : body,
  }
}

function normalizeRequestBody(method: string, body: unknown) {
  if (!body || method === 'GET' || method === 'HEAD') {
    return undefined
  }
  return body
}

function parseHeaders(raw = '') {
  return raw
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(Boolean)
    .reduce<Dict<string>>((output, line) => {
      const index = line.indexOf(':')
      if (index < 0) {
        return output
      }
      const key = line.slice(0, index).trim()
      const value = line.slice(index + 1).trim()
      output[key] = value
      return output
    }, {})
}

function startFetchTransport(options: UniSseTransportOptions): UniSseConnection {
  let aborted = false
  const controller = new AbortController()
  const stop = () => {
    aborted = true
    controller.abort()
  }

  const handleAbort = () => {
    stop()
  }

  options.signal?.addEventListener('abort', handleAbort)

  void (async () => {
    try {
      const headers = normalizeHeaders(options.headers)
      const normalized = normalizeFetchBody(normalizeMethod(options.method), headers, options.body)
      const response = await fetch(options.url, {
        method: normalizeMethod(options.method),
        headers: normalized.headers,
        body: normalized.body as BodyInit | undefined,
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`SSE request failed with status ${response.status}`)
      }
      if (!response.body) {
        throw new Error('Readable stream is not available for the current fetch response')
      }

      const responseHeaders: Dict<string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      options.onOpen?.({
        status: response.status,
        headers: responseHeaders,
        raw: response,
      })

      const reader = response.body.getReader()
      while (!aborted) {
        const result = await reader.read()
        if (result.done) {
          break
        }
        if (result.value) {
          options.onChunk(result.value)
        }
      }

      if (!aborted) {
        options.onComplete()
      }
    }
    catch (error) {
      if (!aborted) {
        options.onError(error)
      }
    }
    finally {
      options.signal?.removeEventListener('abort', handleAbort)
    }
  })()

  return {
    abort: stop,
  }
}

function startRequestTransport(options: UniSseTransportOptions): UniSseConnection {
  let aborted = false
  let failed = false
  const method = normalizeMethod(options.method)
  const requestHeaders = normalizeHeaders(options.headers)
  const requestBody = normalizeRequestBody(method, options.body)

  const requestTask = uni.request({
    url: options.url,
    method: method as never,
    header: requestHeaders,
    data: requestBody,
    enableChunked: true,
    responseType: 'arraybuffer',
    success(response) {
      if (aborted) {
        return
      }
      if (response.data instanceof ArrayBuffer) {
        options.onChunk(response.data)
      }
    },
    fail(error) {
      if (aborted) {
        return
      }
      failed = true
      options.onError(error)
    },
    complete() {
      if (!aborted && !failed) {
        options.onComplete()
      }
    },
  }) as unknown as UniApp.RequestTask & {
    onChunkReceived?: (handler: (result: { data?: ArrayBuffer }) => void) => void
  }

  if (typeof requestTask.onChunkReceived === 'function') {
    requestTask.onChunkReceived((result: { data?: ArrayBuffer }) => {
      if (!aborted && result?.data) {
        options.onChunk(result.data)
      }
    })
  }
  else {
    failed = true
    options.onError(new Error('The current uni.request transport does not support onChunkReceived'))
  }

  options.onOpen?.({
    raw: requestTask,
  })

  const stop = () => {
    aborted = true
    requestTask.abort?.()
  }

  options.signal?.addEventListener('abort', stop, { once: true })

  return {
    abort: stop,
  }
}

function startPlusTransport(options: UniSseTransportOptions): UniSseConnection {
  const plusRuntime = (globalThis as { plus?: { net?: { XMLHttpRequest?: new () => any } } }).plus
  const Xhr = plusRuntime?.net?.XMLHttpRequest
  if (!Xhr) {
    throw new Error('plus.net.XMLHttpRequest is not available on the current runtime')
  }

  let aborted = false
  let opened = false
  let lastIndex = 0
  const method = normalizeMethod(options.method)
  const headers = normalizeHeaders(options.headers)
  const xhr = new Xhr()

  const stop = () => {
    aborted = true
    try {
      xhr.abort?.()
    }
    catch {}
  }

  const pushResponseText = () => {
    const text = String(xhr.responseText || '')
    if (text.length <= lastIndex) {
      return
    }
    const chunk = text.slice(lastIndex)
    lastIndex = text.length
    if (chunk) {
      options.onChunk(chunk)
    }
  }

  xhr.onreadystatechange = () => {
    if (aborted) {
      return
    }

    if (xhr.readyState >= 2 && !opened) {
      opened = true
      options.onOpen?.({
        status: Number(xhr.status || 0),
        headers: parseHeaders(typeof xhr.getAllResponseHeaders === 'function' ? xhr.getAllResponseHeaders() : ''),
        raw: xhr,
      })
    }

    if (xhr.readyState === 3) {
      pushResponseText()
      return
    }

    if (xhr.readyState === 4) {
      pushResponseText()
      const status = Number(xhr.status || 0)
      if (status >= 200 && status < 400) {
        options.onComplete()
      }
      else {
        options.onError(new Error(`SSE request failed with status ${status || 'unknown'}`))
      }
    }
  }

  xhr.onerror = (error: unknown) => {
    if (!aborted) {
      options.onError(error)
    }
  }

  xhr.open(method, options.url, true)
  Object.entries(headers).forEach(([key, value]) => {
    xhr.setRequestHeader?.(key, value)
  })

  const normalized = normalizeFetchBody(method, headers, options.body)
  xhr.send(normalized.body || null)

  options.signal?.addEventListener('abort', stop, { once: true })

  return {
    abort: stop,
  }
}

function resolveTransport(mode: UniSseTransportMode = 'auto') {
  if (mode === 'plus') {
    return startPlusTransport
  }
  if (mode === 'fetch') {
    return startFetchTransport
  }
  if (mode === 'request') {
    return startRequestTransport
  }

  const plusRuntime = (globalThis as { plus?: { net?: { XMLHttpRequest?: new () => any } } }).plus
  if (plusRuntime?.net?.XMLHttpRequest) {
    return startPlusTransport
  }
  if (typeof fetch === 'function' && typeof ReadableStream !== 'undefined') {
    return startFetchTransport
  }
  return startRequestTransport
}

function createMessageParser(handlers: {
  onMessage?: (message: UniSseMessage) => void
  onRetry?: (retry: number) => void
}) {
  let buffer = ''
  let dataLines: string[] = []
  let eventName = ''
  let lastEventId = ''
  let pendingRetry: number | undefined
  let rawLines: string[] = []

  const dispatch = () => {
    if (!dataLines.length && !eventName && !lastEventId) {
      pendingRetry = undefined
      rawLines = []
      return
    }

    handlers.onMessage?.({
      id: lastEventId || undefined,
      event: eventName || undefined,
      data: dataLines.join('\n'),
      retry: pendingRetry,
      raw: rawLines.join('\n'),
    })

    dataLines = []
    eventName = ''
    pendingRetry = undefined
    rawLines = []
  }

  const processLine = (line: string) => {
    if (!line) {
      dispatch()
      return
    }

    rawLines.push(line)

    if (line.startsWith(':')) {
      return
    }

    const index = line.indexOf(':')
    const field = index >= 0 ? line.slice(0, index) : line
    const value = index >= 0 ? line.slice(index + 1).replace(/^ /u, '') : ''

    if (field === 'data') {
      dataLines.push(value)
      return
    }
    if (field === 'event') {
      eventName = value
      return
    }
    if (field === 'id') {
      lastEventId = value
      return
    }
    if (field === 'retry') {
      const retry = Number(value)
      if (Number.isFinite(retry) && retry >= 0) {
        pendingRetry = retry
        handlers.onRetry?.(retry)
      }
    }
  }

  return {
    push(chunk: string) {
      buffer += chunk

      let start = 0
      for (let index = 0; index < buffer.length; index += 1) {
        if (buffer[index] !== '\n') {
          continue
        }

        let line = buffer.slice(start, index)
        if (line.endsWith('\r')) {
          line = line.slice(0, -1)
        }
        processLine(line)
        start = index + 1
      }

      buffer = buffer.slice(start)
    },
    flush() {
      if (buffer) {
        processLine(buffer.replace(/\r$/u, ''))
        buffer = ''
      }
      dispatch()
    },
  }
}

export async function defaultEventSourceExecutor(input: UniSseExecutorInput) {
  const method = normalizeMethod(input.method)
  const timeout = input.timeout ?? DEFAULT_TIMEOUT
  const heartbeatTimeout = input.heartbeatTimeout ?? DEFAULT_HEARTBEAT_TIMEOUT
  const maxRetryCount = input.maxRetryCount ?? DEFAULT_MAX_RETRY_COUNT
  let retryDelay = input.retryDelay ?? DEFAULT_RETRY_DELAY
  let retryCount = 0
  let connection: UniSseConnection | undefined
  let stopped = false

  return await new Promise<void>((resolve, reject) => {
    const stop = () => {
      if (stopped) {
        return
      }
      stopped = true
      connection?.abort()
      resolve()
    }

    input.signal?.addEventListener('abort', stop, { once: true })

    const start = () => {
      if (stopped) {
        return
      }

      let settled = false
      let requestTimer: ReturnType<typeof setTimeout> | undefined
      let heartbeatTimer: ReturnType<typeof setTimeout> | undefined
      const decoder = new TextDecoder()
      const parser = createMessageParser({
        onMessage(message) {
          resetHeartbeat()
          input.onMessage?.(message)
        },
        onRetry(retry) {
          retryDelay = retry
        },
      })

      const clearTimers = () => {
        if (requestTimer) {
          clearTimeout(requestTimer)
        }
        if (heartbeatTimer) {
          clearTimeout(heartbeatTimer)
        }
      }

      const resetHeartbeat = () => {
        if (!heartbeatTimeout) {
          return
        }
        if (heartbeatTimer) {
          clearTimeout(heartbeatTimer)
        }
        heartbeatTimer = setTimeout(() => {
          connection?.abort()
          handleError(new Error('SSE heartbeat timeout'))
        }, heartbeatTimeout)
      }

      const handleComplete = () => {
        if (settled || stopped) {
          return
        }
        settled = true
        clearTimers()
        parser.flush()
        input.onFinish?.()
        resolve()
      }

      const handleError = (reason: unknown) => {
        if (settled || stopped) {
          return
        }
        settled = true
        clearTimers()

        input.onError?.(reason)

        if (retryCount >= maxRetryCount) {
          reject(asError(reason, 'SSE request failed'))
          return
        }

        retryCount += 1
        const delay = retryDelay * Math.pow(2, retryCount - 1)
        input.onRetry?.({
          attempt: retryCount,
          delay,
          error: reason,
        })

        setTimeout(() => {
          if (!stopped) {
            start()
          }
        }, delay)
      }

      if (timeout) {
        requestTimer = setTimeout(() => {
          connection?.abort()
          handleError(new Error('SSE request timeout'))
        }, timeout)
      }

      resetHeartbeat()

      try {
        const transport = resolveTransport(input.transport)
        connection = transport({
          url: input.url,
          method,
          headers: input.headers,
          body: input.body,
          signal: input.signal,
          onOpen(result) {
            retryCount = 0
            input.onOpen?.(result)
            resetHeartbeat()
          },
          onChunk(chunk) {
            resetHeartbeat()
            if (typeof chunk === 'string') {
              parser.push(chunk)
              return
            }

            const bytes = chunk instanceof Uint8Array
              ? chunk
              : new Uint8Array(chunk)

            parser.push(decoder.decode(bytes, { stream: true }))
          },
          onError: handleError,
          onComplete: handleComplete,
        })
      }
      catch (error) {
        handleError(error)
      }
    }

    start()
  })
}
