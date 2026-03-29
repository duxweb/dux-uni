import { defineStore } from 'pinia'

export const useBasePreferencesStore = defineStore('starter-base-preferences', {
  state: () => ({
    homeNoticeVisible: true,
    featureVisitedCount: 0,
  }),
  actions: {
    setHomeNoticeVisible(value: boolean) {
      this.homeNoticeVisible = value
    },
    markFeatureVisited() {
      this.featureVisitedCount += 1
    },
    reset() {
      this.homeNoticeVisible = true
      this.featureVisitedCount = 0
    },
  },
  persist: {
    enabled: true,
  },
})
