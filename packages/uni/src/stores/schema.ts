import type { UniSchemaNode } from '../types'
import { defineStore } from 'pinia'

export const useSchemaStore = defineStore('dux-uni-schema', {
  state: () => ({
    pages: {} as Record<string, UniSchemaNode[]>,
  }),
  actions: {
    setPageSchema(name: string, schema: UniSchemaNode[]) {
      this.pages[name] = schema
    },
    clearPageSchema(name: string) {
      delete this.pages[name]
    },
  },
})
