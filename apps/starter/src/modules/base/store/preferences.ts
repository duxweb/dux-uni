import { defineStore } from 'pinia'

type ThemeMode = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

export const useBasePreferencesStore = defineStore('starter-base-preferences', {
  state: () => ({
    homeNoticeVisible: true,
    featureVisitedCount: 0,
    themeMode: 'system' as ThemeMode,
    systemTheme: 'light' as ResolvedTheme,
  }),
  getters: {
    resolvedTheme(state): ResolvedTheme {
      return state.themeMode === 'system' ? state.systemTheme : state.themeMode
    },
    themeModeLabel(state): string {
      if (state.themeMode === 'system') {
        return `跟随系统 (${state.systemTheme === 'dark' ? '深色' : '浅色'})`
      }
      return state.themeMode === 'dark' ? '深色模式' : '浅色模式'
    },
  },
  actions: {
    setHomeNoticeVisible(value: boolean) {
      this.homeNoticeVisible = value
    },
    markFeatureVisited() {
      this.featureVisitedCount += 1
    },
    setThemeMode(value: ThemeMode) {
      this.themeMode = value
    },
    cycleThemeMode() {
      const modes: ThemeMode[] = ['system', 'light', 'dark']
      const index = modes.indexOf(this.themeMode)
      this.themeMode = modes[(index + 1) % modes.length]
    },
    setSystemTheme(value: string | undefined) {
      this.systemTheme = value === 'dark' ? 'dark' : 'light'
    },
    reset() {
      this.homeNoticeVisible = true
      this.featureVisitedCount = 0
      this.themeMode = 'system'
    },
  },
  persist: {
    enabled: true,
  },
})
