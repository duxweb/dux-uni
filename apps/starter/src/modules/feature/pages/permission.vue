<route lang="json">
{
  "title": "权限能力"
}
</route>

<script setup lang="ts">
import { useAuth, useCan, usePageTitle, useRouter } from '@duxweb/uni'
import { computed } from 'vue'
import { wrapAsyncEvent } from '@/utils/async'

const router = useRouter()
const auth = useAuth()
const canViewAdmin = useCan('system.admin')

const permissions = computed(() => {
  const value = auth.value?.permissions
  if (Array.isArray(value)) {
    return value.map(item => String(item))
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).filter(key => Boolean((value as Record<string, unknown>)[key]))
  }
  return []
})

usePageTitle('权限能力')

const openProtectedPage = wrapAsyncEvent('feature.permission.openProtectedPage', async () => {
  if (!auth.value?.token) {
    await router.login()
    return
  }

  if (!canViewAdmin.value) {
    await router.to('/pages/system/forbidden/index')
    return
  }

  await router.to('/pages/feature/secure')
})
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx]">
      <wd-cell-group border>
        <wd-cell title="system.admin" :value="canViewAdmin ? '允许访问' : '未授权'" />
        <wd-cell title="无权限回退" value="system.forbidden" />
      </wd-cell-group>
    </view>

    <view class="flex flex-col gap-[14rpx] overflow-hidden rounded-[24rpx] bg-surface px-[24rpx] py-[24rpx]">
      <text class="text-[28rpx] text-neutral-stronger font-semibold">
        当前权限
      </text>
      <view class="flex flex-wrap gap-[10rpx]">
        <wd-tag v-for="permission in permissions" :key="permission" plain type="primary">
          {{ permission }}
        </wd-tag>
      </view>
      <wd-button type="primary" block @click="openProtectedPage">
        打开受保护页面
      </wd-button>
    </view>
  </view>
</template>
