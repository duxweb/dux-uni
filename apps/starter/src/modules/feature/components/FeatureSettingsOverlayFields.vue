<script setup lang="ts">
const props = defineProps<{
  name?: string
  notify?: boolean
  channel?: string
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:notify': [value: boolean]
  'update:channel': [value: string]
}>()
</script>

<template>
  <view class="overflow-hidden rounded-[24rpx]">
    <wd-cell-group border>
      <wd-input :model-value="props.name || ''" label="名称" placeholder="请输入名称" @update:model-value="emit('update:name', $event)" />
      <wd-input :model-value="props.channel || ''" label="通知渠道" placeholder="如：站内消息 / 企业微信" @update:model-value="emit('update:channel', $event)" />
      <wd-cell title="启用提醒">
        <template #right-icon>
          <wd-switch :model-value="Boolean(props.notify)" @update:model-value="emit('update:notify', $event)" />
        </template>
      </wd-cell>
    </wd-cell-group>
  </view>
</template>
