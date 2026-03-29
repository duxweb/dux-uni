<route lang="json">
{
  "title": "账户",
  "auth": true,
  "tabBarIcon": {
    "iconPath": "static/tabbar/account.svg",
    "selectedIconPath": "static/tabbar/account-active.svg"
  }
}
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth, useCheck, useLogout } from '@duxweb/uni'
const auth = useAuth()
const isLogin = computed(() => Boolean(auth.value?.token))
const permissions = computed(() => {
  const value = auth.value?.permissions
  return Array.isArray(value) ? value : []
})
const checkAction = useCheck()
const logoutAction = useLogout({
  redirectTo: '/pages/auth/login',
})
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">账户会话</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          模板默认只内置最基础的登录态和权限展示。
        </text>
      </view>
      <wd-cell-group border custom-class="rounded-[24rpx]! overflow-hidden!">
        <wd-cell title="登录状态" :value="isLogin ? '已登录' : '未登录'" />
        <wd-cell title="用户名称" :value="String(auth.value?.user?.name || '未设置')" />
        <wd-cell title="Token" :value="String(auth.value?.token || '无')" />
      </wd-cell-group>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">权限标记</text>
      </view>
      <view class="flex flex-wrap gap-[12rpx]">
        <wd-tag v-for="item in permissions" :key="item" plain type="primary">
          {{ item }}
        </wd-tag>
        <wd-tag v-if="!permissions.length" plain>暂无权限</wd-tag>
      </view>
    </view>

    <view class="grid grid-cols-2 gap-[16rpx]">
      <wd-button plain :loading="checkAction.isPending.value" @click="checkAction.check({})">
        校验会话
      </wd-button>
      <wd-button type="primary" :loading="logoutAction.isPending.value" @click="logoutAction.logout({})">
        退出登录
      </wd-button>
    </view>
  </view>
</template>
