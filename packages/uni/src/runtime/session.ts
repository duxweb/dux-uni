import type { UniAuthState, UniStorageAdapter } from '../types'

async function loadUniPromisesStorage() {
  return await import('@uni-helper/uni-promises')
}

export interface SessionManager {
  initialize(): Promise<UniAuthState | null>
  hydrateSync(): UniAuthState | null
  getAuth(): UniAuthState | null
  setAuth(auth: UniAuthState | null): Promise<void>
  clear(): Promise<void>
  isAuthenticated(): boolean
}

const memoryStorage = new Map<string, unknown>()

export function createMemoryStorageAdapter(): UniStorageAdapter {
  return {
    async get(key) {
      return (memoryStorage.get(key) as any) ?? null
    },
    async set(key, value) {
      memoryStorage.set(key, value)
    },
    async remove(key) {
      memoryStorage.delete(key)
    },
  }
}

export function createStorageAdapter(storage?: UniStorageAdapter): UniStorageAdapter {
  if (storage) {
    return storage
  }

  if (typeof uni !== 'undefined') {
    return {
      async get(key) {
        try {
          const { getStorage } = await loadUniPromisesStorage()
          const result = await getStorage({ key })
          return result.data as any
        }
        catch {
          return null
        }
      },
      async set(key, value) {
        const { setStorage } = await loadUniPromisesStorage()
        await setStorage({
          key,
          data: value,
        })
      },
      async remove(key) {
        try {
          const { removeStorage } = await loadUniPromisesStorage()
          await removeStorage({ key })
        }
        catch {
          // Ignore missing-key and platform-specific remove errors.
        }
      },
    }
  }

  return createMemoryStorageAdapter()
}

export function createSessionManager(options?: {
  storage?: UniStorageAdapter
  storageKey?: string
}) {
  const storage = createStorageAdapter(options?.storage)
  const storageKey = options?.storageKey || '@duxweb/uni/session'
  let auth: UniAuthState | null = null

  return {
    async initialize() {
      auth = await storage.get<UniAuthState>(storageKey) || null
      return auth
    },
    hydrateSync() {
      if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') {
        return auth
      }
      try {
        auth = uni.getStorageSync(storageKey) || null
      }
      catch {
        auth = auth || null
      }
      return auth
    },
    getAuth() {
      return auth
    },
    async setAuth(nextAuth: UniAuthState | null) {
      auth = nextAuth
      if (nextAuth) {
        await storage.set(storageKey, nextAuth)
        return
      }
      await storage.remove(storageKey)
    },
    async clear() {
      auth = null
      await storage.remove(storageKey)
    },
    isAuthenticated() {
      return Boolean(auth?.token)
    },
  }
}
