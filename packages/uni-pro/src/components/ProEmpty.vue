<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: '暂无内容',
  description: '当前模块还没有可展示的数据。',
})
</script>

<template>
  <view class="rounded-card bg-surface px-[32rpx] py-[60rpx] flex flex-col items-center gap-[14rpx] text-center">
    <view class="h-[88rpx] w-[88rpx] rounded-full bg-background-muted" />
    <text class="text-neutral-stronger text-[28rpx] font-semibold">{{ props.title }}</text>
    <text class="text-neutral-muted text-[24rpx] leading-relaxed">{{ props.description }}</text>
  </view>
</template>
