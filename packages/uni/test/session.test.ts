import { describe, expect, it } from 'vitest'
import { createMemoryStorageAdapter, createSessionManager } from '../src/runtime/session'

describe('createSessionManager', () => {
  it('persists auth state into storage', async () => {
    const storage = createMemoryStorageAdapter()
    const session = createSessionManager({
      storage,
      storageKey: 'test-session',
    })

    await session.setAuth({
      token: 'token-a',
      user: { id: 1 },
    })

    const restored = createSessionManager({
      storage,
      storageKey: 'test-session',
    })

    expect(await restored.initialize()).toEqual({
      token: 'token-a',
      user: { id: 1 },
    })
    expect(restored.isAuthenticated()).toBe(true)
  })
})
