<script setup lang="ts">
const props = withDefaults(defineProps<{
  padding?: string
  gap?: string
  bottomInset?: string
}>(), {
  padding: '24rpx',
  gap: '24rpx',
  bottomInset: '56rpx',
})
</script>

<template>
  <view
    class="min-h-screen"
    :style="{
      padding: props.padding,
      paddingBottom: `calc(env(safe-area-inset-bottom) + ${props.bottomInset})`,
    }"
  >
    <view class="flex flex-col" :style="{ gap: props.gap }">
      <slot />
    </view>
  </view>
</template>
