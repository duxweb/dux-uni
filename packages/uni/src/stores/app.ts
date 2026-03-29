import type { UniPageMeta } from '../types'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('dux-uni-app', {
  state: () => ({
    appName: '',
    pages: [] as UniPageMeta[],
    pageTitle: '',
    pagePath: '',
  }),
  actions: {
    setApp(payload: { appName?: string; pages?: UniPageMeta[] }) {
      if (payload.appName !== undefined) {
        this.appName = payload.appName
      }
      if (payload.pages) {
        this.pages = payload.pages
      }
    },
    setPageTitle(payload: { title?: string, path?: string }) {
      if (payload.title !== undefined) {
        this.pageTitle = payload.title
      }
      if (payload.path !== undefined) {
        this.pagePath = payload.path
      }
    },
  },
})
