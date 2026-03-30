import type { UniResolvedTheme } from '../runtime/theme.ts'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { resolveSystemThemeSync, resolveThemePreferenceCapabilitySync } from '../runtime/theme.ts'

export type UniThemePreference = 'system' | 'light' | 'dark'

function normalizeUserThemePreference(value: unknown): UniThemePreference {
  if (resolveThemePreferenceCapabilitySync() === 'system-only') {
    return 'system'
  }

  return value === 'light' || value === 'dark' ? value : 'system'
}

function resolveStoredThemePreferenceSync(): UniThemePreference {
  try {
    const rawValue = typeof uni !== 'undefined'
      ? uni.getStorageSync?.('dux-uni-theme')
      : undefined

    if (typeof rawValue === 'string' && rawValue) {
      const parsed = JSON.parse(rawValue) as { themePreference?: unknown }
      return normalizeUserThemePreference(parsed.themePreference)
    }

    if (rawValue && typeof rawValue === 'object') {
      const parsed = rawValue as { themePreference?: unknown }
      return normalizeUserThemePreference(parsed.themePreference)
    }
  }
  catch {
    // Ignore malformed persisted data and fall back to system mode.
  }

  return 'system'
}

export const useThemeStore = defineStore('dux-uni-theme', () => {
  const themePreference = ref<UniThemePreference>(resolveStoredThemePreferenceSync())
  const systemTheme = ref<UniResolvedTheme>(resolveSystemThemeSync())
  const themePreferenceCapability = computed(() => resolveThemePreferenceCapabilitySync())
  const canSetThemePreference = computed(() => themePreferenceCapability.value === 'manual')

  const resolvedTheme = computed<UniResolvedTheme>(() => {
    return themePreference.value === 'system' ? systemTheme.value : themePreference.value
  })

  function setThemePreference(value: UniThemePreference) {
    themePreference.value = normalizeUserThemePreference(value)
  }

  function setRuntimeThemePreference(value: UniThemePreference) {
    themePreference.value = value
  }

  function cycleThemePreference() {
    if (!canSetThemePreference.value) {
      themePreference.value = 'system'
      return
    }

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
    themePreferenceCapability,
    canSetThemePreference,
    systemTheme,
    resolvedTheme,
    setThemePreference,
    setRuntimeThemePreference,
    cycleThemePreference,
    setSystemTheme,
    resetThemePreference,
  }
}, {
  persist: {
    enabled: true,
  },
} as any)
