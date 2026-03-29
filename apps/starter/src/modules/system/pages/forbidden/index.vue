<route lang="json">
{
  "name": "system.forbidden",
  "title": "无权限"
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'
import AppStatusTip from '@/components/AppStatusTip.vue'
import { wrapAsyncEvent } from '@/utils/async'

const router = useRouter()

usePageTitle('无权限')

const backHome = wrapAsyncEvent('system.forbidden.backHome', async () => {
  await router.home()
})

const openAccount = wrapAsyncEvent('system.forbidden.openAccount', async () => {
  await router.module('account')
})
</script>

<template>
  <view class="min-h-[70vh] flex flex-col items-center justify-center gap-[24rpx] py-[24rpx]">
    <AppStatusTip image="network" tip="当前账号没有访问这个页面的权限" />
    <view class="max-w-[520rpx] w-full flex flex-col gap-[14rpx]">
      <wd-button type="primary" block @click="backHome">
        返回首页
      </wd-button>
      <wd-button plain block @click="openAccount">
        去我的页查看权限
      </wd-button>
    </view>
  </view>
</template>
