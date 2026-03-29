import { createSharedComposable } from '@vueuse/core'
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme.ts'

export const useThemePreference = createSharedComposable(() => {
  const themeStore = useThemeStore()

  return {
    themeStore,
    themePreference: computed(() => themeStore.themePreference),
    systemTheme: computed(() => themeStore.systemTheme),
    currentTheme: computed(() => themeStore.resolvedTheme),
    setThemePreference: (value: 'system' | 'light' | 'dark') => themeStore.setThemePreference(value),
    cycleThemePreference: () => themeStore.cycleThemePreference(),
  }
})
