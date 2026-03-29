import type {
  UniModuleManifest,
  UniModuleRegisterContext,
  UniSocketMessage,
} from '../types'

export interface CreateSocketBridgeResult {
  event: string
  payload?: unknown
}

export interface CreateSocketBridgeOptions {
  manager?: string
  status?: string
  messages?: Record<
    string,
    string | ((message: UniSocketMessage, context: Pick<UniModuleRegisterContext, 'events' | 'module'> & {
      event: string
    }) => CreateSocketBridgeResult | void)
  >
}

export function createSocketBridge(options: CreateSocketBridgeOptions): Pick<UniModuleManifest, 'register'> {
  return {
    register({ events, module }) {
      const eventPrefix = options.manager ? `socket:${options.manager}` : 'socket'

      if (options.status) {
        events.on(`${eventPrefix}:open`, () => {
          events.emit(options.status as string, {
            status: 'open',
            connected: true,
          })
        })

        events.on(`${eventPrefix}:close`, () => {
          events.emit(options.status as string, {
            status: 'closed',
            connected: false,
          })
        })

        events.on(`${eventPrefix}:error`, (error) => {
          events.emit(options.status as string, {
            status: 'error',
            connected: false,
            error,
          })
        })
      }

      Object.entries(options.messages || {}).forEach(([name, target]) => {
        events.on(`${eventPrefix}:${name}`, (payload) => {
          const message = payload as UniSocketMessage
          if (typeof target === 'string') {
            events.emit(target, message.data)
            return
          }

          const result = target(message, {
            events,
            module,
            event: name,
          })
          if (result?.event) {
            events.emit(result.event, result.payload)
          }
        })
      })
    },
  }
}
