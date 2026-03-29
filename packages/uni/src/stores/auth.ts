import type { UniAuthState } from '../types'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('dux-uni-auth', {
  state: (): {
    auth: UniAuthState | null
  } => ({
    auth: null,
  }),
  getters: {
    token: state => state.auth?.token,
    permissions: state => state.auth?.permissions,
    user: state => state.auth?.user,
    isAuthenticated: state => Boolean(state.auth?.token),
  },
  actions: {
    setAuth(auth: UniAuthState | null) {
      this.auth = auth
    },
    clear() {
      this.auth = null
    },
  },
})
