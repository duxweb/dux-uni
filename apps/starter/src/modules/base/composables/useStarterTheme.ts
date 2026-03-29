import { createSharedComposable } from '@vueuse/core'
import { computed } from 'vue'
import { useBasePreferencesStore } from '../store/preferences'

export const useStarterTheme = createSharedComposable(() => {
  const preferencesStore = useBasePreferencesStore()

  return {
    preferencesStore,
    currentTheme: computed(() => preferencesStore.resolvedTheme),
    themeModeLabel: computed(() => preferencesStore.themeModeLabel),
    cycleThemeMode: () => preferencesStore.cycleThemeMode(),
  }
})
