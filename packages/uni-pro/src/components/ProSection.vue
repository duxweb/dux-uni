<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {})
</script>

<template>
  <view class="rounded-card bg-surface p-page shadow-card">
    <view v-if="props.title || props.description" class="mb-gap flex flex-col gap-[8rpx]">
      <text v-if="props.title" class="text-neutral-stronger text-[30rpx] font-semibold">{{ props.title }}</text>
      <text v-if="props.description" class="text-neutral-muted text-[24rpx] leading-relaxed">
        {{ props.description }}
      </text>
    </view>
    <slot />
  </view>
</template>
