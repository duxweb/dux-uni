import { defineStore } from 'pinia'

export const useBasePreferencesStore = defineStore('template-base-preferences', {
  state: () => ({
    introCollapsed: false,
  }),
  actions: {
    setIntroCollapsed(value: boolean) {
      this.introCollapsed = value
    },
    toggleIntro() {
      this.introCollapsed = !this.introCollapsed
    },
  },
  persist: {
    enabled: true,
  },
})
