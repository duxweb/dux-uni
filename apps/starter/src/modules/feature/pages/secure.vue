<route lang="json">
{
  "title": "受保护页面",
  "auth": true,
  "permission": "system.admin"
}
</route>

<script setup lang="ts">
import { usePageTitle } from '@duxweb/uni'

usePageTitle('受保护页面')
</script>

<template>
  <view class="overflow-hidden rounded-[24rpx] bg-surface px-[24rpx] py-[24rpx]">
    <text class="text-[28rpx] text-neutral-strong">
      如果你能看到这个页面，说明当前账号拥有 `system.admin` 权限。
    </text>
  </view>
</template>
