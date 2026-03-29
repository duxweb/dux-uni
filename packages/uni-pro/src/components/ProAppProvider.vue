<script setup lang="ts">
import type { DuxThemeTokens } from '@duxweb/uni'
import DuxRoot from './DuxRoot.vue'

defineProps<{
  theme?: 'light' | 'dark'
  tokens?: Partial<DuxThemeTokens>
}>()
</script>

<template>
  <DuxRoot v-bind="$props">
    <slot />
  </DuxRoot>
</template>
