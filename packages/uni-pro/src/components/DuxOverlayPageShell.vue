<script setup lang="ts">
import { computed, inject } from 'vue'
import { useOverlayContext } from '@duxweb/uni'
import { OVERLAY_LAYOUT_CONTEXT_KEY } from './overlayLayoutContext'

const props = withDefaults(defineProps<{
  title?: string
  confirmText?: string
  cancelText?: string
  submit?: () => unknown | Promise<unknown>
  padded?: boolean
  safeAreaTop?: boolean
  safeAreaBottom?: boolean
  reserveTabBar?: boolean
  hasFooterSlot?: boolean
  fillHeight?: boolean
}>(), {
  confirmText: '确定',
  cancelText: '取消',
  padded: true,
  safeAreaTop: false,
  safeAreaBottom: false,
  reserveTabBar: false,
  hasFooterSlot: false,
  fillHeight: false,
})

const overlay = useOverlayContext<unknown, unknown>()
const overlayLayout = inject(OVERLAY_LAYOUT_CONTEXT_KEY, undefined)
const isRightDrawer = computed(() => overlay.kind === 'drawer' && overlayLayout?.entry.position !== 'bottom')
const isBottomDrawer = computed(() => overlay.kind === 'drawer' && overlayLayout?.entry.position === 'bottom')
const rootClass = computed(() => props.fillHeight ? 'flex h-full min-h-0 flex-col bg-surface' : 'flex min-h-0 max-h-full flex-col bg-surface')
const contentContainerClass = computed(() => {
  if (props.fillHeight) {
    return 'min-h-0 flex-1 overflow-y-auto'
  }

  if (isBottomDrawer.value) {
    return 'min-h-0 block'
  }

  return 'min-h-0 flex-1 overflow-y-auto'
})
const contentAreaStyle = computed(() => {
  if (isBottomDrawer.value && overlayLayout) {
    return {
      maxHeight: overlayLayout.viewport.bottomDrawerContentMaxHeight,
    }
  }

  return undefined
})
const contentInnerStyle = computed(() => {
  if (!props.padded) {
    return undefined
  }

  return {
    padding: '28rpx',
  }
})
const showCloseAction = computed(() => !isRightDrawer.value)
const headerStyle = computed(() => ({
  paddingTop: props.safeAreaTop && isRightDrawer.value && overlayLayout
    ? `${overlayLayout.viewport.topGap}px`
    : '24rpx',
  paddingBottom: '24rpx',
}))
const footerStyle = computed(() => {
  if (!props.safeAreaBottom && !props.reserveTabBar) {
    return {
      paddingTop: '24rpx',
      paddingBottom: '40rpx',
    }
  }

  const parts = ['40rpx']

  if (props.safeAreaBottom && overlayLayout) {
    parts.push(`${overlayLayout.viewport.bottomGap}px`)
  }

  if (props.reserveTabBar) {
    parts.push('124rpx')
  }

  return {
    paddingTop: '24rpx',
    paddingBottom: `calc(${parts.join(' + ')})`,
  }
})

async function close() {
  await overlay.close()
}

async function submit() {
  overlay.setLoading(true)

  try {
    if (!props.submit) {
      await overlay.submit()
      return
    }

    const result = await props.submit()
    if (typeof result !== 'undefined') {
      await overlay.submit(result)
      return
    }

    overlay.setLoading(false)
  }
  catch (error) {
    overlay.setLoading(false)
    throw error
  }
}

defineExpose({
  submit,
  close,
})
</script>

<template>
  <view :class="rootClass">
    <view
      class="flex items-center justify-between gap-[16rpx] border-b border-neutral-subtle px-[28rpx]"
      :style="headerStyle"
    >
      <text class="flex-1 truncate text-[30rpx] font-semibold text-neutral-stronger">
        {{ title || '操作面板' }}
      </text>
      <view class="flex items-center gap-[16rpx]">
        <slot name="extra" />
        <view
          v-if="showCloseAction"
          class="flex h-[64rpx] w-[64rpx] items-center justify-center rounded-full bg-neutral-faint"
          hover-class="opacity-80"
          @click="close"
        >
          <wd-icon name="close" size="16px" color="var(--dux-color-neutral-muted)" />
        </view>
      </view>
    </view>

    <scroll-view
      v-if="props.fillHeight || isBottomDrawer"
      scroll-y
      :show-scrollbar="false"
      :class="contentContainerClass"
      :style="contentAreaStyle"
    >
      <view :style="contentInnerStyle">
        <slot />
      </view>
    </scroll-view>

    <view v-else :class="contentContainerClass" :style="contentAreaStyle">
      <view :style="contentInnerStyle">
        <slot />
      </view>
    </view>

    <view
      class="border-t border-neutral-subtle px-[28rpx]"
      :style="footerStyle"
    >
      <slot v-if="props.hasFooterSlot" name="footer" />
      <template v-else>
        <view class="grid grid-cols-2 gap-[16rpx]">
          <wd-button plain block @click="close">
            {{ cancelText }}
          </wd-button>
          <wd-button type="primary" block :loading="overlay.loading" @click="submit">
            {{ confirmText }}
          </wd-button>
        </view>
      </template>
    </view>
  </view>
</template>
