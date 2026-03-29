<route lang="json">
{
  "title": "SSE 示例"
}
</route>

<script setup lang="ts">
import type { UniSseExecutorInput } from '@duxweb/uni'
import { parseSseJson, usePageTitle, useSSE } from '@duxweb/uni'
import { computed } from 'vue'
import AppStatusTip from '@/components/AppStatusTip.vue'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function mockEventSourceExecutor(input: UniSseExecutorInput) {
  input.onOpen?.({
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'x-demo-source': 'mock',
    },
  })

  const chunks = [
    'data: Dux Uni 正在建立流式连接...\n\n',
    'event: token\ndata: 这是一段模拟的\n\n',
    'event: token\ndata: SSE 增量文本输出，\n\n',
    'event: token\ndata: 统一 Hook 会按消息顺序收集。\n\n',
    'event: meta\ndata: {"transport":"mock","platform":"demo"}\n\n',
  ]

  for (const chunk of chunks) {
    if (input.signal?.aborted) {
      return
    }
    await sleep(420)
    input.onMessage?.({
      data: chunk
        .split('\n')
        .find(line => line.startsWith('data:'))
        ?.replace(/^data:\s?/u, '') || '',
      event: chunk
        .split('\n')
        .find(line => line.startsWith('event:'))
        ?.replace(/^event:\s?/u, '') || undefined,
      raw: chunk.trim(),
    })
  }

  if (!input.signal?.aborted) {
    input.onFinish?.()
  }
}

const sse = useSSE<{ transport?: string, platform?: string }>({
  url: 'mock://dux/sse',
  method: 'POST',
  executor: mockEventSourceExecutor,
  parse: message => parseSseJson(message.data),
})

const streamMessages = computed(() => sse.messages.value)
const statusLabel = computed(() => {
  if (sse.streaming.value)
    return '流中'
  if (sse.retrying.value)
    return '重连中'
  if (sse.connecting.value)
    return '连接中'
  return sse.status.value
})

usePageTitle('SSE 示例')

async function startDemo() {
  await sse.connect()
}
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="grid grid-cols-2 gap-[16rpx]">
        <view class="flex flex-col gap-[8rpx] rounded-[20rpx] bg-background px-[20rpx] py-[18rpx]">
          <text class="text-[24rpx] text-neutral-muted">
            连接状态
          </text>
          <text class="text-[30rpx] text-neutral-stronger font-semibold">
            {{ statusLabel }}
          </text>
        </view>
        <view class="flex flex-col gap-[8rpx] rounded-[20rpx] bg-background px-[20rpx] py-[18rpx]">
          <text class="text-[24rpx] text-neutral-muted">
            消息条数
          </text>
          <text class="text-[30rpx] text-neutral-stronger font-semibold">
            {{ streamMessages.length }}
          </text>
        </view>
      </view>

      <view class="grid grid-cols-2 gap-[16rpx]">
        <wd-button type="primary" block @click="startDemo">
          开始连接
        </wd-button>
        <wd-button plain block @click="sse.close()">
          停止连接
        </wd-button>
        <wd-button plain block @click="sse.reset()">
          清空消息
        </wd-button>
      </view>
    </view>

    <view class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        聚合文本
      </text>
      <text class="min-h-[160rpx] whitespace-pre-wrap text-[24rpx] text-neutral-strong leading-[1.8]">
        {{ sse.text || '尚未开始流式输出' }}
      </text>
    </view>

    <view class="flex flex-col gap-[14rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        消息明细
      </text>
      <view
        v-for="(item, index) in streamMessages"
        :key="`${index}-${item.data}`"
        class="flex flex-col gap-[8rpx] rounded-[18rpx] bg-background px-[18rpx] py-[16rpx]"
      >
        <view class="flex items-center justify-between gap-[12rpx]">
          <text class="text-[24rpx] text-neutral-stronger font-semibold">
            {{ item.event || 'message' }}
          </text>
          <text class="text-[22rpx] text-neutral-muted">
            #{{ index + 1 }}
          </text>
        </view>
        <text class="whitespace-pre-wrap text-[24rpx] text-neutral-muted leading-[1.7]">
          {{ item.data }}
        </text>
      </view>
      <AppStatusTip v-if="!streamMessages.length" image="content" tip="还没有收到任何 SSE 消息" />
    </view>
  </view>
</template>
