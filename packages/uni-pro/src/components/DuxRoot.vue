<script setup lang="ts">
import type { DuxThemeTokens } from '@duxweb/uni'
import { computed } from 'vue'
import DuxOverlayHost from './DuxOverlayHost.vue'
import { createUnoThemeVars, createWotThemeVars } from '../theme'

const props = withDefaults(defineProps<{
  theme?: 'light' | 'dark'
  tokens?: Partial<DuxThemeTokens>
  overlayRegistry?: any
}>(), {
  theme: 'light',
})

const themeVars = computed(() => createWotThemeVars(props.tokens, props.theme))
const unoThemeVars = computed(() => createUnoThemeVars(props.tokens, props.theme))
</script>

<template>
  <wd-config-provider :theme="theme" :theme-vars="themeVars">
    <view class="min-h-full" :style="unoThemeVars">
      <slot />
      <wd-root-portal />
      <wd-toast :z-index="1400" />
      <DuxOverlayHost :overlay-registry="overlayRegistry" />
    </view>
  </wd-config-provider>
</template>
