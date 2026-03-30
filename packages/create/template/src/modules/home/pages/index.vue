<route lang="json">
{
  "title": "首页",
  "auth": true,
  "type": "home"
}
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth, useModules, useRoute } from '@duxweb/uni'
const auth = useAuth()
const route = useRoute()
const isLogin = computed(() => Boolean(auth.value?.token))
const moduleList = useModules()
const modules = computed(() => moduleList.value.map(item => item.name))
const profile = computed(() => auth.value?.user || {})
const routeQueryText = computed(() => JSON.stringify(route.query || {}, null, 2))
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="rounded-shell bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-[28rpx] py-[34rpx] text-white shadow-[0_18rpx_40rpx_rgba(15,118,110,0.18)]">
      <view class="flex flex-col gap-[10rpx]">
        <view class="w-fit rounded-[999rpx] border border-white/20 bg-white/10 px-[18rpx] py-[8rpx] text-[22rpx] text-white/80">
          Template App
        </view>
        <text class="text-[44rpx] font-bold leading-tight">应用从模块开始组织，而不是从页面文件开始堆砌</text>
        <text class="text-[24rpx] text-white/80 leading-relaxed">
          当前账号：{{ String(profile.name || '未登录') }}，状态：{{ isLogin ? '已登录' : '未登录' }}。
        </text>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">模板起点</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          这个模板只保留基础模块与布局，业务开发从 src/modules/* 开始扩展。
        </text>
      </view>
      <view class="grid grid-cols-1 gap-[16rpx]">
        <view class="rounded-card bg-surface-muted p-[20rpx]">
          <text class="text-text text-[26rpx] font-semibold block">模块目录</text>
          <text class="text-text-secondary text-[22rpx] leading-relaxed mt-[6rpx]">
            每个模块独立维护 pages、store、components、index 入口。
          </text>
        </view>
        <view class="rounded-card bg-surface-muted p-[20rpx]">
          <text class="text-text text-[26rpx] font-semibold block">配置单源</text>
          <text class="text-text-secondary text-[22rpx] leading-relaxed mt-[6rpx]">
            `dux.config.ts` 统一控制模块装配、骨架路由和主题 token。
          </text>
        </view>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">已装配模块</text>
      </view>
      <view class="flex flex-wrap gap-[12rpx]">
        <wd-tag v-for="item in modules" :key="item" plain type="primary">
          {{ item }}
        </wd-tag>
      </view>
    </view>

    <view class="rounded-card bg-surface p-page shadow-[0_12rpx_32rpx_rgba(15,23,42,0.06)]">
      <view class="mb-gap flex flex-col gap-[8rpx]">
        <text class="text-text text-[30rpx] font-semibold">当前路由</text>
        <text class="text-text-secondary text-[24rpx] leading-relaxed">
          模板里直接用 `useRoute()` 读取当前页面信息，不需要手动解析 `getCurrentPages()`。
        </text>
      </view>
      <view class="flex flex-col gap-[12rpx]">
        <wd-tag plain type="primary">{{ route.name || 'unknown' }}</wd-tag>
        <text class="text-text-secondary text-[22rpx] font-mono break-all">{{ route.fullPath || route.path }}</text>
        <text class="text-text-secondary text-[22rpx] font-mono break-all">{{ routeQueryText }}</text>
      </view>
    </view>
  </view>
</template>
