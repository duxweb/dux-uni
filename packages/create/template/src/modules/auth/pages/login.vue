<route lang="json">
{
  "title": "登录",
  "guestOnly": true,
  "middleware": ["guest"],
  "style": {
    "navigationStyle": "custom"
  }
}
</route>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLogin } from '@duxweb/uni'
const username = ref('admin')
const password = ref('admin123')
const errorMessage = ref('')
const loginAction = useLogin({
  redirectTo: '/pages/home/index',
})
const loginLoading = computed(() => loginAction.isPending.value)

async function submit() {
  errorMessage.value = ''
  try {
    await loginAction.login({
      username: username.value,
      password: password.value,
    })
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  }
}
</script>

<template>
  <view class="flex flex-col gap-8">
    <view class="flex flex-col gap-5">
      <view class="w-fit rounded-[999rpx] border border-white/25 bg-white/12 px-[18rpx] py-[8rpx] text-[22rpx] text-white/80">
        Dux Uni Template
      </view>
      <view class="text-white text-[48rpx] font-bold leading-tight max-w-[620rpx]">
        从模板开始约束模块化结构、主题 token 和运行时边界
      </view>
      <view class="text-white/70 text-[26rpx] leading-relaxed max-w-[640rpx]">
        默认账号仅用于模板验证：账号 `admin`，密码 `admin123`。
      </view>
    </view>

    <view class="bg-white rounded-[36rpx] p-[32rpx] shadow-lg">
      <view class="flex flex-col gap-[10rpx] mb-6">
        <text class="text-[#0f172a] text-[40rpx] font-bold">模板登录</text>
        <text class="text-[#667085] text-[24rpx]">这部分代表最小登录流，业务注册找回密码自行扩展。</text>
      </view>

      <view class="flex flex-col gap-5">
        <view class="overflow-hidden rounded-[24rpx]">
          <wd-cell-group border>
            <wd-input v-model="username" label="用户名" placeholder="请输入用户名" clearable />
            <wd-input v-model="password" label="密码" placeholder="请输入密码" show-password />
          </wd-cell-group>
        </view>

        <wd-notice-bar
          v-if="errorMessage"
          type="danger"
          :text="errorMessage"
          :scrollable="false"
        />

        <wd-button type="primary" block :loading="loginLoading" @click="submit">
          {{ loginLoading ? '登录中...' : '进入模板' }}
        </wd-button>
      </view>
    </view>
  </view>
</template>
