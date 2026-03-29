<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, useSlots } from 'vue'
import DuxOverlayPageShell from './DuxOverlayPageShell.vue'
import { OVERLAY_CONTENT_API_KEY } from './overlayContentApi'

const props = withDefaults(defineProps<{
  title?: string
  confirmText?: string
  cancelText?: string
  submit?: () => unknown | Promise<unknown>
  refreshLayout?: () => void | Promise<void>
  padded?: boolean
  reserveTabBar?: boolean
}>(), {
  confirmText: '确定',
  cancelText: '取消',
  padded: true,
  reserveTabBar: false,
})

const registerContentApi = inject(OVERLAY_CONTENT_API_KEY, undefined)
const slots = useSlots()

const contentApi = {
  submit: () => props.submit?.(),
  refreshLayout: () => props.refreshLayout?.(),
}

onMounted(() => {
  registerContentApi?.({
    submit: contentApi.submit,
    refreshLayout: contentApi.refreshLayout,
  })
})

onBeforeUnmount(() => {
  registerContentApi?.(undefined)
})
</script>

<template>
  <DuxOverlayPageShell
    :title="props.title"
    :confirm-text="props.confirmText"
    :cancel-text="props.cancelText"
    :submit="props.submit"
    :padded="props.padded"
    :reserve-tab-bar="props.reserveTabBar"
    :has-footer-slot="Boolean(slots.footer)"
  >
    <template v-if="slots.extra" #extra>
      <slot name="extra" />
    </template>
    <template v-if="slots.footer" #footer>
      <slot name="footer" />
    </template>
    <slot />
  </DuxOverlayPageShell>
</template>
