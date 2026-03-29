<script setup lang="ts">
import type { ImageMode } from 'wot-design-uni/components/wd-img/types'
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  image?: string
  tip?: string
  urlPrefix?: string | string[]
  imageSize?: string | number | {
    width: number | string
    height: number | string
  }
  imageMode?: ImageMode
}>(), {
  image: 'network',
  tip: '',
  urlPrefix: () => [
    'https://cdn.jsdelivr.net/npm/wot-design-uni-assets@1.0.4/files/',
    'https://unpkg.com/wot-design-uni-assets@1.0.4/files/',
  ],
  imageSize: 160,
  imageMode: 'aspectFit',
})

const presetImages = new Set(['search', 'network', 'content', 'collect', 'comment', 'halo', 'message'])
const prefixList = computed(() => Array.isArray(props.urlPrefix) ? props.urlPrefix : [props.urlPrefix])
const candidateImages = computed(() => {
  if (presetImages.has(props.image)) {
    return prefixList.value.filter(Boolean).map(prefix => `${prefix}${props.image}.png`)
  }
  return props.image ? [props.image] : []
})
const imageIndex = ref(0)
const resolvedImage = computed(() => candidateImages.value[imageIndex.value] || '')
const resolvedWidth = computed(() => typeof props.imageSize === 'object' ? props.imageSize.width : props.imageSize)
const resolvedHeight = computed(() => typeof props.imageSize === 'object' ? props.imageSize.height : props.imageSize)

watch(candidateImages, () => {
  imageIndex.value = 0
}, {
  immediate: true,
})

function handleImageError() {
  if (imageIndex.value < candidateImages.value.length - 1) {
    imageIndex.value += 1
  }
}
</script>

<template>
  <wd-status-tip :tip="tip">
    <template #image>
      <slot v-if="$slots.image" name="image" />
      <wd-img
        v-else-if="resolvedImage"
        :src="resolvedImage"
        :width="resolvedWidth"
        :height="resolvedHeight"
        :mode="imageMode"
        @error="handleImageError"
      />
    </template>
    <template v-if="$slots.bottom" #bottom>
      <slot name="bottom" />
    </template>
  </wd-status-tip>
</template>
