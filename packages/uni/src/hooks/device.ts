import type { MaybeRef } from 'vue'
import type { UniAppContext, UniAuthorizeScope, UniImageAsset, UniLocationResult } from '../types'
import { computed, ref, unref } from 'vue'
import {
  useClipboardData,
  useScanCode as useUniScanCode,
  useSocket as useUniSocket,
} from '@uni-helper/uni-use'
import type { UseScanCodeOptions, UseSocketOptions, UseSocketReturn } from '@uni-helper/uni-use'
import { resolveHookAppOptions } from './shared'

function normalizeLocation(result: Record<string, unknown>): UniLocationResult {
  return {
    latitude: Number(result.latitude || 0),
    longitude: Number(result.longitude || 0),
    accuracy: typeof result.accuracy === 'number' ? result.accuracy : undefined,
    altitude: typeof result.altitude === 'number' ? result.altitude : undefined,
    speed: typeof result.speed === 'number' ? result.speed : undefined,
    verticalAccuracy: typeof result.verticalAccuracy === 'number' ? result.verticalAccuracy : undefined,
    horizontalAccuracy: typeof result.horizontalAccuracy === 'number' ? result.horizontalAccuracy : undefined,
    address: typeof result.address === 'string' ? result.address : undefined,
    name: typeof result.name === 'string' ? result.name : undefined,
    ...result,
  }
}

function normalizeImageAsset(file: Record<string, unknown>): UniImageAsset {
  return {
    path: String(file.path || file.tempFilePath || ''),
    size: typeof file.size === 'number' ? file.size : undefined,
    name: typeof file.name === 'string' ? file.name : undefined,
    type: typeof file.type === 'string' ? file.type : undefined,
    extname: typeof file.extname === 'string' ? file.extname : undefined,
    duration: typeof file.duration === 'number' ? file.duration : undefined,
    width: typeof file.width === 'number' ? file.width : undefined,
    height: typeof file.height === 'number' ? file.height : undefined,
    ...file,
  }
}

export function useAuthorize(appOrScope?: UniAppContext | MaybeRef<UniAuthorizeScope | UniAuthorizeScope[] | undefined>, maybeScope?: MaybeRef<UniAuthorizeScope | UniAuthorizeScope[] | undefined>) {
  const { app, options: scope } = resolveHookAppOptions(appOrScope, maybeScope)
  const granted = ref<Record<string, boolean>>({})
  const loading = ref(false)
  const error = ref<unknown>()

  function getScopes(input?: UniAuthorizeScope | UniAuthorizeScope[]) {
    const value = input || unref(scope)
    if (!value) {
      return []
    }
    return Array.isArray(value) ? value : [value]
  }

  async function refresh(input?: UniAuthorizeScope | UniAuthorizeScope[]) {
    const scopes = getScopes(input)
    const settings = await uni.getSetting()
    const authSetting = (settings.authSetting || {}) as unknown as Record<string, boolean | undefined>
    const next = { ...granted.value }
    scopes.forEach((item) => {
      next[item] = authSetting[item] === true
    })
    granted.value = next
    return next
  }

  async function request(input?: UniAuthorizeScope | UniAuthorizeScope[]) {
    const scopes = getScopes(input)
    loading.value = true
    error.value = undefined

    try {
      for (const item of scopes) {
        try {
          await uni.authorize({ scope: item as never })
          granted.value = {
            ...granted.value,
            [item]: true,
          }
        }
        catch (err) {
          granted.value = {
            ...granted.value,
            [item]: false,
          }
          throw err
        }
      }
      return granted.value
    }
    catch (err) {
      error.value = err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  async function ensure(input?: UniAuthorizeScope | UniAuthorizeScope[]) {
    const scopes = getScopes(input)
    await refresh(scopes)
    const denied = scopes.filter(item => granted.value[item] !== true)
    if (!denied.length) {
      return true
    }
    await request(denied)
    return denied.every(item => granted.value[item] === true)
  }

  return {
    app,
    granted: computed(() => granted.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh,
    request,
    ensure,
    openSettings() {
      return uni.openAppAuthorizeSetting()
    },
  }
}

export function useLocation(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)
  const loading = ref(false)
  const error = ref<unknown>()
  const value = ref<UniLocationResult>()
  const authorize = useAuthorize(app, 'scope.userLocation')

  async function get(options: UniApp.GetLocationOptions = {}) {
    loading.value = true
    error.value = undefined
    try {
      await authorize.ensure('scope.userLocation')
      const result = await uni.getLocation({
        type: 'gcj02',
        ...options,
      })
      value.value = normalizeLocation(result as any)
      return value.value
    }
    catch (err) {
      error.value = err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  async function choose(options: UniApp.ChooseLocationOptions = {}) {
    loading.value = true
    error.value = undefined
    try {
      await authorize.ensure('scope.userLocation')
      const result = await uni.chooseLocation(options)
      value.value = normalizeLocation(result as any)
      return value.value
    }
    catch (err) {
      error.value = err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  function open(options: UniApp.OpenLocationOptions) {
    return uni.openLocation(options)
  }

  return {
    app,
    authorize,
    value: computed(() => value.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    get,
    choose,
    open,
  }
}

export function useImagePicker(appOrNothing?: UniAppContext) {
  const { app } = resolveHookAppOptions(appOrNothing, undefined)
  const loading = ref(false)
  const error = ref<unknown>()
  const files = ref<UniImageAsset[]>([])
  const authorize = useAuthorize(app, ['scope.camera', 'scope.writePhotosAlbum'])

  async function pick(options: UniApp.ChooseImageOptions = {}) {
    loading.value = true
    error.value = undefined
    try {
      const result = await uni.chooseImage(options)
      const nextFiles = Array.isArray(result.tempFiles)
        ? result.tempFiles.map(item => normalizeImageAsset(item as any))
        : (Array.isArray(result.tempFilePaths) ? result.tempFilePaths : []).map((path: string) => normalizeImageAsset({ path }))
      files.value = nextFiles
      return nextFiles
    }
    catch (err) {
      error.value = err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    app,
    authorize,
    files: computed(() => files.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    pick,
    clear() {
      files.value = []
    },
  }
}

export function useClipboard(initialValue = '') {
  return useClipboardData(initialValue)
}

export function useScanCode(options?: UseScanCodeOptions) {
  const scanner = useUniScanCode(options)
  return {
    scan: scanner,
  }
}

export function useShare() {
  return {
    open(options: UniNamespace.ShareOptions) {
      return uni.share(options as never)
    },
  }
}

export function usePhoneCall() {
  return {
    call(phoneNumber: string) {
      return uni.makePhoneCall({ phoneNumber })
    },
  }
}

export function useOpenLocation() {
  return {
    open(options: UniApp.OpenLocationOptions) {
      return uni.openLocation(options)
    },
  }
}

export function useSocket<Data = unknown>(
  url: MaybeRef<string | URL | undefined>,
  appOrOptions?: UniAppContext | Omit<UseSocketOptions, 'headers'> & {
    auth?: boolean
  },
  maybeOptions: Omit<UseSocketOptions, 'headers'> & {
    auth?: boolean
  } = {},
): UseSocketReturn<Data> & {
  sendJson: (payload: unknown, useBuffer?: boolean) => boolean
} {
  const { app, options = maybeOptions } = resolveHookAppOptions(appOrOptions, maybeOptions)
  const enabledAuth = options.auth !== false
  const auth = app.session.getAuth()
  const socket = useUniSocket<Data>(url, {
    ...options,
    headers: {
      ...(enabledAuth && auth?.token ? { Authorization: auth.token } : {}),
    },
    onConnected(task: UniApp.SocketTask, result: UniApp.OnSocketOpenCallbackResult) {
      app.events.emit('socket:open', { task, result })
      options.onConnected?.(task, result)
    },
    onClosed(task: UniApp.SocketTask, result: UniApp.OnSocketCloseOptions) {
      app.events.emit('socket:close', { task, result })
      options.onClosed?.(task, result)
    },
    onError(task: UniApp.SocketTask, result: UniApp.GeneralCallbackResult) {
      app.events.emit('socket:error', { task, result })
      options.onError?.(task, result)
    },
    onMessage(task: UniApp.SocketTask, result: UniApp.OnSocketMessageCallbackResult) {
      app.events.emit('socket:message', { task, result })
      options.onMessage?.(task, result)
    },
  }) as UseSocketReturn<Data>

  return {
    ...socket,
    sendJson(payload: unknown, useBuffer = true) {
      return socket.send(JSON.stringify(payload), useBuffer)
    },
  }
}
