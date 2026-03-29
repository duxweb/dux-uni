import { defineStore } from 'pinia'

export const useSessionStore = defineStore('dux-uni-session', {
  state: () => ({
    initialized: false,
    authenticated: false,
  }),
  actions: {
    setState(payload: { initialized?: boolean; authenticated?: boolean }) {
      if (typeof payload.initialized === 'boolean') {
        this.initialized = payload.initialized
      }
      if (typeof payload.authenticated === 'boolean') {
        this.authenticated = payload.authenticated
      }
    },
  },
})
