<script setup lang="ts">
import { computed } from 'vue'
import { useOverlayContext } from '@duxweb/uni'

const props = withDefaults(defineProps<{
  title?: string
  confirmText?: string
  cancelText?: string
  submit?: () => unknown | Promise<unknown>
  padded?: boolean
  safeAreaBottom?: boolean
  reserveTabBar?: boolean
}>(), {
  confirmText: '确定',
  cancelText: '取消',
  padded: true,
  safeAreaBottom: false,
  reserveTabBar: false,
})

const overlay = useOverlayContext<unknown, unknown>()
const contentClass = computed(() => props.padded ? 'px-[28rpx] py-[24rpx]' : '')
const footerBottomClass = computed(() => {
  const base = props.safeAreaBottom ? 'pb-[calc(env(safe-area-inset-bottom)+24rpx)]' : 'pb-[24rpx]'

  if (!props.reserveTabBar) {
    return base
  }

  return props.safeAreaBottom
    ? 'pb-[calc(env(safe-area-inset-bottom)+148rpx)]'
    : 'pb-[148rpx]'
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
  <view class="flex h-full flex-col bg-surface">
    <view class="flex items-center justify-between gap-[16rpx] border-b border-neutral-subtle px-[28rpx] py-[24rpx]">
      <text class="flex-1 truncate text-[30rpx] font-semibold text-neutral-stronger">
        {{ title || '操作面板' }}
      </text>
      <view class="flex items-center gap-[16rpx]">
        <slot name="extra" :close="close" :submit="submit" :loading="overlay.loading" />
        <view
          class="flex h-[56rpx] w-[56rpx] items-center justify-center rounded-full bg-neutral-faint"
          hover-class="opacity-80"
          @click="close"
        >
          <wd-icon name="close" size="18px" color="var(--dux-color-neutral-muted)" />
        </view>
      </view>
    </view>

    <view class="min-h-0 flex-1 overflow-y-auto" :class="contentClass">
      <slot :close="close" :submit="submit" :loading="overlay.loading" />
    </view>

    <view
      class="border-t border-neutral-subtle px-[28rpx] pt-[20rpx]"
      :class="footerBottomClass"
    >
      <slot name="footer" :close="close" :submit="submit" :loading="overlay.loading">
        <view class="grid grid-cols-2 gap-[16rpx]">
          <wd-button plain block @click="close">
            {{ cancelText }}
          </wd-button>
          <wd-button type="primary" block :loading="overlay.loading" @click="submit">
            {{ confirmText }}
          </wd-button>
        </view>
      </slot>
    </view>
  </view>
</template>
