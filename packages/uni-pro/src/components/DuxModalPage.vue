<script setup lang="ts">
import { ref } from 'vue'
import DuxOverlayPageShell from './DuxOverlayPageShell.vue'

const props = withDefaults(defineProps<{
  title?: string
  confirmText?: string
  cancelText?: string
  submit?: () => unknown | Promise<unknown>
  padded?: boolean
  reserveTabBar?: boolean
}>(), {
  confirmText: '确定',
  cancelText: '取消',
  padded: true,
  reserveTabBar: false,
})

const shellRef = ref<{
  submit?: () => unknown | Promise<unknown>
  close?: () => Promise<void>
}>()

defineExpose({
  submit: () => shellRef.value?.submit?.(),
  close: () => shellRef.value?.close?.(),
})
</script>

<template>
  <DuxOverlayPageShell
    ref="shellRef"
    :title="props.title"
    :confirm-text="props.confirmText"
    :cancel-text="props.cancelText"
    :submit="props.submit"
    :padded="props.padded"
    :reserve-tab-bar="props.reserveTabBar"
  >
    <template #extra>
      <slot name="extra" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
    <template #default>
      <slot />
    </template>
  </DuxOverlayPageShell>
</template>
