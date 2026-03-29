import { usePreferredDark } from '@uni-helper/uni-use'
import { createSharedComposable } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useBasePreferencesStore } from '../store/preferences'

export const useStarterTheme = createSharedComposable(() => {
  const preferencesStore = useBasePreferencesStore()
  const prefersDark = usePreferredDark()

  watch(prefersDark, (value) => {
    preferencesStore.setSystemTheme(value ? 'dark' : 'light')
  }, {
    immediate: true,
  })

  return {
    preferencesStore,
    currentTheme: computed(() => preferencesStore.resolvedTheme),
    themeModeLabel: computed(() => preferencesStore.themeModeLabel),
    cycleThemeMode: () => preferencesStore.cycleThemeMode(),
  }
})
