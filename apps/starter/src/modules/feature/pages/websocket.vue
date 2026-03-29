<route lang="json">
{
  "title": "WebSocket 示例"
}
</route>

<script setup lang="ts">
import { usePageTitle, useSocket } from '@duxweb/uni'
import { computed, ref } from 'vue'
import AppStatusTip from '@/components/AppStatusTip.vue'
import { formatClockTime } from '@/utils/format'

const isWechatMiniProgram = typeof wx !== 'undefined'
const socketEndpoint = 'wss://echo.websocket.events'
const socketMessages = ref<Array<{ type: string, data: string }>>([])
const socketError = ref('')

const socket = useSocket<string>(socketEndpoint, {
  auth: false,
  onConnected() {
    socketError.value = ''
  },
  onClosed() {},
  onError(_, result) {
    socketError.value = result?.errMsg || '连接失败'
  },
  onMessage(_, result) {
    const data = typeof result?.data === 'string' ? result.data : JSON.stringify(result?.data || '')
    socketMessages.value = [
      {
        type: 'message',
        data,
      },
      ...socketMessages.value,
    ].slice(0, 12)
  },
})

const statusLabel = computed(() => socket.status.value)
const endpointLabel = computed(() => isWechatMiniProgram ? '需配置业务域名后替换为你自己的 WebSocket 地址' : socketEndpoint)

usePageTitle('WebSocket 示例')

function connectSocket() {
  socketError.value = ''
  if (isWechatMiniProgram) {
    socketError.value = '微信小程序 WebSocket 需要在后台配置合法业务域名，公开 echo 服务默认不可直接连接。'
    return
  }
  socket.open()
}

function closeSocket() {
  socket.close({})
}

function clearMessages() {
  socketMessages.value = []
}

function sendDemo() {
  const sent = socket.sendJson({
    event: 'chat.message',
    data: `dux-uni websocket demo @ ${formatClockTime()}`,
  })

  if (!sent) {
    socketError.value = '当前连接未打开，消息已进入缓冲或发送失败'
  }
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
            {{ socketMessages.length }}
          </text>
        </view>
      </view>

      <view class="flex flex-col gap-[8rpx] rounded-[20rpx] bg-background px-[20rpx] py-[18rpx]">
        <text class="text-[24rpx] text-neutral-muted">
          当前地址
        </text>
        <text class="break-all text-[24rpx] text-neutral-strong leading-[1.6]">
          {{ endpointLabel }}
        </text>
      </view>

      <view class="grid grid-cols-2 gap-[16rpx]">
        <wd-button type="primary" block @click="connectSocket">
          开始连接
        </wd-button>
        <wd-button plain block @click="closeSocket">
          关闭连接
        </wd-button>
        <wd-button plain block @click="sendDemo">
          发送消息
        </wd-button>
        <wd-button plain block @click="clearMessages">
          清空消息
        </wd-button>
      </view>

      <AppStatusTip v-if="socketError" image="network" :tip="socketError" />
    </view>

    <view class="flex flex-col gap-[14rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        消息明细
      </text>
      <view
        v-for="(item, index) in socketMessages"
        :key="`${index}-${item.data}`"
        class="flex flex-col gap-[8rpx] rounded-[18rpx] bg-background px-[18rpx] py-[16rpx]"
      >
        <view class="flex items-center justify-between gap-[12rpx]">
          <text class="text-[24rpx] text-neutral-stronger font-semibold">
            {{ item.type }}
          </text>
          <text class="text-[22rpx] text-neutral-muted">
            #{{ index + 1 }}
          </text>
        </view>
        <text class="whitespace-pre-wrap text-[24rpx] text-neutral-muted leading-[1.7]">
          {{ item.data }}
        </text>
      </view>
      <AppStatusTip v-if="!socketMessages.length && !socketError" image="content" tip="还没有收到任何 WebSocket 消息" />
    </view>
  </view>
</template>
