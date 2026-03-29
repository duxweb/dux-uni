import type {
  Dict,
  UniAppContext,
  UniSocketManager,
  UniSocketManagerConfig,
  UniSocketManagerConnectOptions,
  UniSocketManagerParseResult,
  UniSocketMessage,
} from '../types'
import { shallowReactive } from 'vue'

const DEFAULT_SOCKET_RETRY_DELAY = 1000
const DEFAULT_SOCKET_RETRY_COUNT = -1
const DEFAULT_SOCKET_HEARTBEAT_INTERVAL = 15000
const DEFAULT_SOCKET_PONG_TIMEOUT = 15000

interface CreateSocketManagerOptions {
  name?: string
  eventPrefix?: string
  getConfig?: (app: UniAppContext) => UniSocketManagerConfig | undefined
}

function normalizeSocketText(raw: unknown) {
  if (typeof raw === 'string') {
    return raw
  }
  if (raw instanceof ArrayBuffer) {
    return new TextDecoder().decode(new Uint8Array(raw))
  }
  if (raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)) {
    return normalizeSocketText((raw as Record<string, unknown>).data)
  }
  return typeof raw === 'undefined' ? '' : JSON.stringify(raw)
}

function defaultSocketParse(raw: unknown): UniSocketManagerParseResult {
  const text = normalizeSocketText(raw)
  if (!text) {
    return {
      text,
      data: raw,
    }
  }

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    const event = ['event', 'type', 'action', 'channel', 'name']
      .map(key => parsed[key])
      .find(value => typeof value === 'string')
    const data = parsed.data ?? parsed.payload ?? parsed.body ?? parsed
    const innerText = typeof data === 'string' ? data : undefined
    return {
      event: typeof event === 'string' ? event : undefined,
      data,
      text: innerText || text,
    }
  }
  catch {
    return {
      text,
      data: text,
    }
  }
}

function resolveSocketHeaders(app: UniAppContext, options: UniSocketManagerConnectOptions) {
  const headers = {
    ...(options.headers || {}),
  } as Dict<string>

  if (options.auth !== false) {
    const token = app.session.getAuth()?.token
    if (token) {
      headers.Authorization = token
    }
  }

  return headers
}

function resolveSocketUrl(
  app: UniAppContext,
  options: UniSocketManagerConnectOptions,
  getConfig: (app: UniAppContext) => UniSocketManagerConfig | undefined,
) {
  return options.url || getConfig(app)?.url
}

function extendSocketEventPayload<T extends object>(payload: T, manager?: string) {
  if (!manager) {
    return payload
  }
  return {
    ...payload,
    manager,
  }
}

export function createSocketManager(
  getApp: () => UniAppContext,
  options: CreateSocketManagerOptions = {},
): UniSocketManager {
  const name = options.name
  const eventPrefix = options.eventPrefix || 'socket'
  const getConfig = options.getConfig || ((app: UniAppContext) => app.config.socket)
  const state = shallowReactive<{
    status: UniSocketManager['status']
    connected: boolean
    retryCount: number
    activeUrl?: string
    lastMessage?: UniSocketMessage
    error?: unknown
  }>({
    status: 'idle',
    connected: false,
    retryCount: 0,
  })

  let task: UniApp.SocketTask | undefined
  let lastOptions: UniSocketManagerConnectOptions | undefined
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined
  let pongTimer: ReturnType<typeof setTimeout> | undefined
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let manuallyClosed = false
  let resumeOnShow = false
  let initialized = false
  let connectNonce = 0
  const subscriptions = new Set<{
    matcher?: string | ((message: UniSocketMessage) => boolean)
    handler: (message: UniSocketMessage) => void
  }>()

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = undefined
    }
    if (pongTimer) {
      clearTimeout(pongTimer)
      pongTimer = undefined
    }
  }

  function clearReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
    }
  }

  function emitMessage(message: UniSocketMessage) {
    const app = getApp()
    const nextMessage = {
      ...message,
      manager: name,
    }
    state.lastMessage = nextMessage
    app.events.emit(`${eventPrefix}:message`, nextMessage)
    if (message.event) {
      app.events.emit(`${eventPrefix}:${message.event}`, nextMessage)
    }
    subscriptions.forEach((subscription) => {
      const matcher = subscription.matcher
      if (!matcher) {
        subscription.handler(nextMessage)
        return
      }
      if (typeof matcher === 'string') {
        if (message.event === matcher) {
          subscription.handler(nextMessage)
        }
        return
      }
      if (matcher(nextMessage)) {
        subscription.handler(nextMessage)
      }
    })
  }

  function startHeartbeat(options: UniSocketManagerConnectOptions) {
    clearHeartbeat()
    if (!options.heartbeat) {
      return
    }

    const heartbeat = typeof options.heartbeat === 'object' ? options.heartbeat : {}
    const interval = heartbeat.interval || DEFAULT_SOCKET_HEARTBEAT_INTERVAL
    const timeout = heartbeat.pongTimeout || DEFAULT_SOCKET_PONG_TIMEOUT
    const message = heartbeat.message || 'ping'

    heartbeatTimer = setInterval(() => {
      if (!state.connected || !task) {
        return
      }
      try {
        task.send({
          data: message,
        })
      }
      catch {}

      if (pongTimer) {
        clearTimeout(pongTimer)
      }

      pongTimer = setTimeout(() => {
        disconnectInternal(false)
        scheduleReconnect(lastOptions, new Error('Socket heartbeat timeout'))
      }, timeout)
    }, interval)
  }

  function resetPongTimer(options?: UniSocketManagerConnectOptions) {
    if (!options?.heartbeat) {
      return
    }
    const heartbeat = typeof options.heartbeat === 'object' ? options.heartbeat : {}
    const timeout = heartbeat.pongTimeout || DEFAULT_SOCKET_PONG_TIMEOUT
    if (pongTimer) {
      clearTimeout(pongTimer)
    }
    pongTimer = setTimeout(() => {
      disconnectInternal(false)
      scheduleReconnect(lastOptions, new Error('Socket heartbeat timeout'))
    }, timeout)
  }

  function normalizeConnectOptions(input?: Partial<UniSocketManagerConnectOptions>): UniSocketManagerConnectOptions {
    const app = getApp()
    return {
      ...(getConfig(app) || {}),
      ...(lastOptions || {}),
      ...(input || {}),
    }
  }

  function disconnectInternal(manual: boolean) {
    manuallyClosed = manual
    clearHeartbeat()
    clearReconnect()
    if (task) {
      try {
        task.close({} as never)
      }
      catch {}
      task = undefined
    }
    state.connected = false
    state.status = 'closed'
  }

  function scheduleReconnect(options: UniSocketManagerConnectOptions | undefined, reason?: unknown) {
    if (!options) {
      return
    }
    const reconnect = options.autoReconnect
    if (!reconnect || manuallyClosed) {
      return
    }

    const config = typeof reconnect === 'object' ? reconnect : {}
    const retries = typeof config.retries === 'number' ? config.retries : DEFAULT_SOCKET_RETRY_COUNT
    const delay = config.delay || DEFAULT_SOCKET_RETRY_DELAY
    if (retries >= 0 && state.retryCount >= retries) {
      config.onFailed?.()
      return
    }

    state.retryCount += 1
    state.status = 'reconnecting'
    state.error = reason
    clearReconnect()
    reconnectTimer = setTimeout(() => {
      connect(options)
    }, delay)
  }

  function connect(input?: Partial<UniSocketManagerConnectOptions>) {
    const app = getApp()
    const options = normalizeConnectOptions(input)
    const url = resolveSocketUrl(app, options, getConfig)
    if (!url) {
      throw new Error('Socket manager requires a socket url')
    }

    clearReconnect()
    clearHeartbeat()
    if (task) {
      disconnectInternal(false)
    }

    manuallyClosed = false
    lastOptions = {
      ...options,
      url,
    }
    state.activeUrl = url
    state.status = state.retryCount > 0 ? 'reconnecting' : 'connecting'
    state.error = undefined

    const nonce = ++connectNonce
    const headers = resolveSocketHeaders(app, options)
    const currentTask = uni.connectSocket({
      url,
      header: headers,
      protocols: options.protocols,
      method: options.method,
      multiple: false,
    } as never) as unknown as UniApp.SocketTask

    task = currentTask

    currentTask.onOpen((result: UniApp.OnSocketOpenCallbackResult) => {
      if (nonce !== connectNonce) {
        return
      }
      state.connected = true
      state.retryCount = 0
      state.status = 'open'
      app.events.emit(`${eventPrefix}:open`, extendSocketEventPayload({
        result,
        url,
      }, name))
      startHeartbeat(options)
      resetPongTimer(options)
    })

    currentTask.onMessage((result: UniApp.OnSocketMessageCallbackResult) => {
      if (nonce !== connectNonce) {
        return
      }
      resetPongTimer(options)
      const parse = options.parse || defaultSocketParse
      const parsed = parse(result, app)
      emitMessage({
        event: parsed.event,
        data: parsed.data,
        text: parsed.text,
        raw: result,
        receivedAt: Date.now(),
      })
    })

    currentTask.onError((result: UniApp.GeneralCallbackResult) => {
      if (nonce !== connectNonce) {
        return
      }
      state.error = result
      state.status = 'error'
      app.events.emit(`${eventPrefix}:error`, extendSocketEventPayload({
        ...(result || {}),
        raw: result,
      }, name))
      scheduleReconnect(options, result)
    })

    currentTask.onClose((result: UniApp.OnSocketCloseOptions) => {
      if (nonce !== connectNonce) {
        return
      }
      clearHeartbeat()
      state.connected = false
      state.status = 'closed'
      app.events.emit(`${eventPrefix}:close`, extendSocketEventPayload({
        ...(result || {}),
        raw: result,
      }, name))
      scheduleReconnect(options, result)
    })
  }

  function disconnect() {
    disconnectInternal(true)
  }

  function reconnect() {
    const options = lastOptions || getConfig(getApp())
    if (!options) {
      return
    }
    state.retryCount = 0
    connect(options)
  }

  function send(data: string | ArrayBuffer) {
    if (!task || !state.connected) {
      return false
    }
    task.send({
      data,
    })
    return true
  }

  function sendJson(payload: unknown) {
    return send(JSON.stringify(payload))
  }

  function subscribe(matcher: string | ((message: UniSocketMessage) => boolean) | undefined, handler: (message: UniSocketMessage) => void) {
    const subscription = {
      matcher,
      handler,
    }
    subscriptions.add(subscription)
    return () => {
      subscriptions.delete(subscription)
    }
  }

  function subscribeAll(handler: (message: UniSocketMessage) => void) {
    return subscribe(undefined, handler)
  }

  function initialize() {
    if (initialized) {
      return
    }
    initialized = true
    const app = getApp()
    app.events.on('auth:login-success', () => {
      const config = getConfig(app)
      if (config?.connectOnLogin === false) {
        return
      }
      if (config?.url) {
        connect()
      }
    })
    const disconnectOnLogout = () => {
      const config = getConfig(app)
      if (config?.disconnectOnLogout === false) {
        return
      }
      disconnect()
    }
    app.events.on('auth:logout', disconnectOnLogout)
    app.events.on('auth:check-logout', disconnectOnLogout)
  }

  function onLaunch() {
    initialize()
    const app = getApp()
    const config = getConfig(app)
    if (!config?.connectOnLaunch) {
      return
    }
    if (!app.session.isAuthenticated()) {
      return
    }
    if (config.url) {
      connect()
    }
  }

  function onShow() {
    const app = getApp()
    const config = getConfig(app)
    if (config?.keepAliveOnHide === false && resumeOnShow && app.session.isAuthenticated()) {
      resumeOnShow = false
      reconnect()
    }
  }

  function onHide() {
    const app = getApp()
    const config = getConfig(app)
    if (config?.keepAliveOnHide === false && state.connected) {
      resumeOnShow = true
      disconnect()
    }
  }

  return {
    get name() {
      return name
    },
    get status() {
      return state.status
    },
    get connected() {
      return state.connected
    },
    get retryCount() {
      return state.retryCount
    },
    get activeUrl() {
      return state.activeUrl
    },
    get lastMessage() {
      return state.lastMessage
    },
    get error() {
      return state.error
    },
    connect,
    disconnect,
    reconnect,
    send,
    sendJson,
    subscribe,
    subscribeAll,
    onLaunch,
    onShow,
    onHide,
  }
}
