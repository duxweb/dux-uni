import type { UniResolvedTheme } from '../runtime/theme.ts'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { resolveSystemThemeSync } from '../runtime/theme.ts'

export type UniThemePreference = 'system' | 'light' | 'dark'

export const useThemeStore = defineStore('dux-uni-theme', () => {
  const themePreference = ref<UniThemePreference>('system')
  const systemTheme = ref<UniResolvedTheme>(resolveSystemThemeSync())

  const resolvedTheme = computed<UniResolvedTheme>(() => {
    return themePreference.value === 'system' ? systemTheme.value : themePreference.value
  })

  function setThemePreference(value: UniThemePreference) {
    themePreference.value = value
  }

  function cycleThemePreference() {
    const modes: UniThemePreference[] = ['system', 'light', 'dark']
    const index = modes.indexOf(themePreference.value)
    themePreference.value = modes[(index + 1) % modes.length]
  }

  function setSystemTheme(value: string | undefined) {
    systemTheme.value = value === 'dark' ? 'dark' : 'light'
  }

  function resetThemePreference() {
    themePreference.value = 'system'
  }

  return {
    themePreference,
    systemTheme,
    resolvedTheme,
    setThemePreference,
    cycleThemePreference,
    setSystemTheme,
    resetThemePreference,
  }
}, {
  persist: {
    enabled: true,
  },
} as any)
