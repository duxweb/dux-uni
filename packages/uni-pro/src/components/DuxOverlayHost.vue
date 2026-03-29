<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useOverlayEntries } from '@duxweb/uni'
import DuxOverlayPresenter from './DuxOverlayPresenter.vue'

defineProps({
  overlayRegistry: {
    type: [Object, Function, String] as PropType<any>,
    default: undefined,
  },
})

const entries = useOverlayEntries()
const overlayEntries = computed(() => entries.value || [])
const hasVisibleOverlay = computed(() => overlayEntries.value.some(entry => entry.visible))

const lockedElements = new Map<HTMLElement, {
  overflow: string
  touchAction: string
  overscrollBehavior: string
}>()

function readInlineStyle(element: HTMLElement) {
  const style = (element as unknown as { style: CSSStyleDeclaration }).style

  return {
    overflow: style.overflow,
    touchAction: style.touchAction,
    overscrollBehavior: style.overscrollBehavior,
  }
}

function writeInlineStyle(element: HTMLElement, value: {
  overflow: string
  touchAction: string
  overscrollBehavior: string
}) {
  const style = (element as unknown as { style: CSSStyleDeclaration }).style

  style.overflow = value.overflow
  style.touchAction = value.touchAction
  style.overscrollBehavior = value.overscrollBehavior
}

function resolveScrollContainers() {
  if (typeof document === 'undefined') {
    return []
  }

  return [
    document.documentElement,
    document.body,
    ...document.querySelectorAll<HTMLElement>('uni-page-body, .uni-page-body, uni-page-wrapper, .uni-page-wrapper, #app'),
  ].filter((element, index, list) => element && list.indexOf(element) === index)
}

function lockScroll() {
  resolveScrollContainers().forEach((element) => {
    if (!lockedElements.has(element)) {
      lockedElements.set(element, readInlineStyle(element))
    }

    writeInlineStyle(element, {
      overflow: 'hidden',
      touchAction: 'none',
      overscrollBehavior: 'none',
    })
  })
}

function unlockScroll() {
  lockedElements.forEach((style, element) => {
    writeInlineStyle(element, style)
  })
  lockedElements.clear()
}

watch(hasVisibleOverlay, (value) => {
  if (value) {
    lockScroll()
    return
  }

  unlockScroll()
}, {
  immediate: true,
})

onBeforeUnmount(() => {
  unlockScroll()
})
</script>

<template>
  <view class="pointer-events-none">
    <DuxOverlayPresenter
      v-for="entry in overlayEntries"
      :key="entry.id"
      :entry="entry"
      :overlay-registry="overlayRegistry"
    />
  </view>
</template>
