import type { UniAppContext, UniOverlayConfirmContext, UniOverlayEntry, UniOverlayRequest, UniOverlayRuntime } from '../types'
import { reactive, shallowReactive } from 'vue'

function createOverlayId() {
  return `overlay-${Math.random().toString(36).slice(2, 10)}`
}

function removeEntry(entries: UniOverlayEntry[], id: string) {
  const index = entries.findIndex(item => item.id === id)
  if (index >= 0) {
    entries.splice(index, 1)
  }
}

export function createOverlayRuntime(getApp: () => UniAppContext): UniOverlayRuntime {
  const entries = shallowReactive<UniOverlayEntry[]>([])
  const pending = new Map<string, {
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
  }>()

  function get(id: string) {
    return entries.find(item => item.id === id)
  }

  async function finish(id: string, mode: 'resolve' | 'reject', value?: unknown) {
    const entry = get(id)
    if (entry) {
      if (mode === 'resolve' && typeof value === 'undefined' && entry.onClose) {
        await entry.onClose(createOverlayConfirmContext(getApp(), entry as never) as never)
      }
      entry.visible = false
      entry.loading = false
    }

    const promise = pending.get(id)
    pending.delete(id)

    if (!promise) {
      return
    }

    if (mode === 'reject') {
      promise.reject(value)
      return
    }

    promise.resolve(value)
  }

  return {
    entries,
    open<TPayload = unknown, TResult = unknown>(request: UniOverlayRequest<TPayload, TResult>) {
      const id = createOverlayId()
      const kind = request.kind || 'confirm'

      const entry = reactive<UniOverlayEntry>({
        id,
        kind,
        frame: request.frame || 'default',
        position: 'position' in request ? request.position : undefined,
        title: request.title,
        message: 'message' in request ? request.message : undefined,
        confirmText: request.confirmText || '确定',
        cancelText: request.cancelText || '取消',
        payload: request.payload,
        meta: request.meta,
        closeOnClickModal: request.closeOnClickModal ?? kind === 'confirm',
        visible: true,
        loading: false,
        danger: 'danger' in request ? request.danger : undefined,
        width: 'width' in request ? request.width : undefined,
        content: 'content' in request ? request.content : ('component' in request ? request.component : undefined),
        contentKey: 'contentKey' in request
          ? request.contentKey
          : ('componentKey' in request ? request.componentKey : undefined),
        onConfirm: request.onConfirm as UniOverlayEntry['onConfirm'],
        onClose: request.onClose as UniOverlayEntry['onClose'],
      })

      entries.push(entry)

      return new Promise<TResult | undefined>((resolve, reject) => {
        pending.set(id, {
          resolve: resolve as (value: unknown) => void,
          reject,
        })
      })
    },
    get,
    remove(id: string) {
      removeEntry(entries, id)
    },
    async close(id: string) {
      await finish(id, 'resolve', undefined)
    },
    async submit(id: string, result?: unknown) {
      await finish(id, 'resolve', result)
    },
    async reject(id: string, error?: unknown) {
      await finish(id, 'reject', error)
    },
    setLoading(id: string, value: boolean) {
      const entry = get(id)
      if (entry) {
        entry.loading = value
      }
    },
    update(id: string, patch: Partial<UniOverlayEntry>) {
      const entry = get(id)
      if (entry) {
        Object.assign(entry, patch)
      }
    },
  }
}

export function createOverlayConfirmContext<TPayload = unknown, TResult = unknown>(
  app: UniAppContext,
  entry: UniOverlayEntry<TPayload, TResult>,
): UniOverlayConfirmContext<TPayload, TResult> {
  return {
    id: entry.id,
    app,
    get kind() {
      return entry.kind
    },
    get loading() {
      return entry.loading
    },
    get payload() {
      return entry.payload
    },
    get meta() {
      return entry.meta
    },
    close: () => app.overlay.close(entry.id),
    submit: (result?: TResult) => app.overlay.submit(entry.id, result),
    setLoading: (value: boolean) => app.overlay.setLoading(entry.id, value),
    updatePayload: (payload: TPayload) => {
      app.overlay.update(entry.id, { payload })
    },
  }
}
