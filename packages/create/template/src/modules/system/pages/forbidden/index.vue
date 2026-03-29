<route lang="json">
{
  "name": "system.forbidden",
  "title": "无权限"
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'

const router = useRouter()

usePageTitle('无权限')

async function backHome() {
  await router.home()
}
</script>

<template>
  <view class="rounded-[32rpx] bg-white px-[32rpx] py-[40rpx] flex flex-col gap-[16rpx]">
    <view class="w-[92rpx] h-[92rpx] rounded-[28rpx] bg-[#fee2e2] flex items-center justify-center">
      <wd-icon name="warn-bold" size="28px" color="#dc2626" />
    </view>
    <text class="text-[38rpx] font-bold text-[#0f172a]">没有访问权限</text>
    <text class="text-[26rpx] leading-[1.7] text-[#64748b]">
      这是模板内置的默认无权限页。实际业务可以继续扩展权限中间件或替换 fallback 组件。
    </text>
    <wd-button type="primary" block @click="backHome">返回首页</wd-button>
  </view>
</template>
