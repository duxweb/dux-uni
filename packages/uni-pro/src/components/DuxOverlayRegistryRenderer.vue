<script setup lang="ts">
import type { UniOverlayConfirmContext } from '@duxweb/uni'
import {
  OVERLAY_REGISTRY_COMPONENT_NAME,
  UNI_OVERLAY_CONTEXT_KEY,
} from '@duxweb/uni'
import { provide } from 'vue'
import OverlayRegistry from '@/runtime/generated/overlay-registry.vue'

const props = defineProps<{
  registry?: unknown
  name?: string
  context: UniOverlayConfirmContext
}>()

provide(UNI_OVERLAY_CONTEXT_KEY, props.context)
</script>

<template>
  <OverlayRegistry
    v-if="registry === OVERLAY_REGISTRY_COMPONENT_NAME && name"
    :name="name"
    :context="context"
  />
</template>
