<route lang="json">
{
  "title": "实时流能力"
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'
import { wrapAsyncEvent } from '@/utils/async'

const router = useRouter()

const pages = [
  {
    title: 'SSE',
    label: 'useSSE + 事件消息列表',
    path: '/pages/feature/realtime-sse',
  },
  {
    title: 'WebSocket',
    label: 'useSocket + 连接与发送',
    path: '/pages/feature/websocket',
  },
]

usePageTitle('实时流能力')

const open = wrapAsyncEvent('feature.realtime.open', async (path: string) => {
  await router.to(path)
})
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx]">
      <wd-cell-group border>
        <wd-cell
          v-for="item in pages"
          :key="item.path"
          :title="item.title"
          :label="item.label"
          is-link
          @click="open(item.path)"
        />
      </wd-cell-group>
    </view>
  </view>
</template>
