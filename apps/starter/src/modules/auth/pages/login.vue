<route lang="json">
{
  "title": "登录",
  "immersive": true,
  "guestOnly": true,
  "middleware": ["guest"]
}
</route>

<script setup lang="ts">
import { useLogin, usePageGuard } from '@duxweb/uni'
import { computed, ref } from 'vue'
import { useStarterNavSpace } from '@/modules/base/composables/useStarterNavSpace'

const { titleBarStyle, capsulePlaceholderStyle } = useStarterNavSpace()
usePageGuard({
  mode: 'guest',
})
const username = ref('demo')
const password = ref('demo123')
const errorMessage = ref('')

const loginAction = useLogin({
  redirectTo: '/pages/home/index',
})
const loginLoading = computed(() => loginAction.isPending.value)

function fillDemoAccount() {
  username.value = 'demo'
  password.value = 'demo123'
}

async function submit() {
  errorMessage.value = ''
  try {
    await loginAction.login({
      username: username.value,
      password: password.value,
    })
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请重试'
  }
}
</script>

<template>
  <view class="min-h-screen overflow-hidden bg-primary">
    <view class="relative min-h-screen flex flex-col">
      <view class="absolute right-[-96rpx] top-[160rpx] h-[300rpx] w-[300rpx] rounded-full bg-glass-soft" />
      <view class="absolute left-[-120rpx] top-[340rpx] h-[260rpx] w-[260rpx] rounded-full bg-glass" />

      <view class="relative flex flex-col gap-[30rpx] px-[28rpx] pb-[36rpx] pt-[12rpx]">
        <view
          class="flex items-center justify-end gap-[24rpx]"
          :style="titleBarStyle"
        >
          <view aria-hidden="true" :style="capsulePlaceholderStyle" />
        </view>

        <view class="flex flex-col gap-[14rpx] pt-[0rpx]">
          <view class="flex flex-col gap-[14rpx]">
            <text class="text-[60rpx] text-inverse font-bold leading-[1.08] tracking-[1rpx]">
              欢迎登录
            </text>
            <text class="max-w-[520rpx] text-[27rpx] text-inverse-muted leading-[1.75]">
              使用账号密码进入工作台，继续访问页面、表单、列表与设备能力示例。
            </text>
          </view>
        </view>
      </view>

      <view class="relative flex flex-1 flex-col gap-[24rpx] rounded-t-[44rpx] bg-surface px-[28rpx] pb-[calc(env(safe-area-inset-bottom)+32rpx)] pt-[18rpx]">
        <view class="flex justify-center">
          <view class="h-[8rpx] w-[88rpx] rounded-full bg-neutral-200/80" />
        </view>

        <view class="flex items-center justify-between gap-[18rpx] border border-neutral-100 rounded-[26rpx] bg-background-muted px-[22rpx] py-[18rpx]">
          <view class="flex flex-1 flex-col gap-[10rpx]">
            <text class="text-[24rpx] text-neutral-stronger font-semibold">
              演示账号
            </text>
            <view class="flex flex-wrap gap-[10rpx]">
              <view class="inline-flex items-center rounded-full bg-surface px-[16rpx] py-[6rpx]">
                <text class="text-[22rpx] text-neutral leading-[1.3]">
                  账号 demo
                </text>
              </view>
              <view class="inline-flex items-center rounded-full bg-surface px-[16rpx] py-[6rpx]">
                <text class="text-[22rpx] text-neutral leading-[1.3]">
                  密码 demo123
                </text>
              </view>
            </view>
          </view>
          <wd-button size="small" plain @click="fillDemoAccount">
            一键填入
          </wd-button>
        </view>

        <view class="overflow-hidden border border-neutral-100 rounded-[28rpx] bg-background-muted">
          <wd-cell-group border>
            <wd-input
              v-model="username"
              label="用户名"
              placeholder="请输入用户名"
              clearable
            />
            <wd-input
              v-model="password"
              label="密码"
              placeholder="请输入密码"
              show-password
            />
          </wd-cell-group>
        </view>

        <view v-if="errorMessage" class="overflow-hidden rounded-[18rpx]">
          <wd-notice-bar
            type="danger"
            :text="errorMessage"
            :scrollable="false"
          />
        </view>

        <wd-button
          type="primary"
          block
          :loading="loginLoading"
          @click="submit"
        >
          {{ loginLoading ? '登录中...' : '登录' }}
        </wd-button>

        <view class="flex items-center justify-center gap-[10rpx] pt-[4rpx]">
          <view class="h-[8rpx] w-[8rpx] rounded-full bg-success" />
          <text class="text-[22rpx] text-neutral-muted leading-[1.6]">
            当前为 Starter 示例环境
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
