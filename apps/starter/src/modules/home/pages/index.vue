<route lang="json">
{
  "title": "首页",
  "tabBarIcon": {
    "iconPath": "static/tabbar/home.svg",
    "selectedIconPath": "static/tabbar/home-active.svg"
  }
}
</route>

<script setup lang="ts">
import type { DemoOverview } from '@/demo/types'
import { useAuth, useCustom, usePageTitle, useRouter } from '@duxweb/uni'
import { computed } from 'vue'
import { useBasePreferencesStore } from '@/modules/base/store/preferences'
import { wrapAsyncEvent } from '@/utils/async'
import { useNetworkStatusDemo } from '../composables/useNetworkStatusDemo'

const network = useNetworkStatusDemo()
const router = useRouter()
const auth = useAuth()
const preferencesStore = useBasePreferencesStore()

const overviewQuery = useCustom<DemoOverview>({
  path: 'demo/overview',
  method: 'GET',
})

const overview = computed(() => overviewQuery.data.value?.data)
const currentUser = computed(() => auth.value?.user?.name || '演示用户')

const coreFeatures = [
  { key: 'auth', title: '鉴权会话', summary: 'useAuth / useLogin / useCheck', icon: 'lock-on', tone: 'primary' },
  { key: 'query', title: '查询编排', summary: 'vue-query + useList / useInvalidate', icon: 'view-list', tone: 'success' },
  { key: 'form', title: '表单渲染', summary: 'useForm / useSelect / useTree / useJsonSchema', icon: 'edit-1', tone: 'accent' },
  { key: 'files', title: '文件能力', summary: 'useUpload / useDownload', icon: 'download', tone: 'warning' },
  { key: 'router', title: '原生路由', summary: 'useRouter / useRoute 统一跳转', icon: 'home', tone: 'info' },
  { key: 'module', title: '模块架构', summary: '按 modules 组织页面、状态与能力入口', icon: 'user', tone: 'neutral' },
]

const highlightIconMap: Record<string, string> = {
  核心: 'setting',
  表单: 'edit-1',
  起步: 'home',
  扩展: 'link',
  弹层: 'windows',
}

const heroStyle = {
  backgroundColor: 'var(--dux-color-primary)',
}

usePageTitle(computed(() => overview.value?.greeting ? `${overview.value.greeting}` : '首页'))

const openFeature = wrapAsyncEvent('home.openFeature', async () => {
  preferencesStore.markFeatureVisited()
  await router.module('feature')
})

const openAccount = wrapAsyncEvent('home.openAccount', async () => {
  await router.module('account')
})

const refreshOverview = wrapAsyncEvent('home.refreshOverview', async () => {
  await overviewQuery.refetch()
})

function hideHomeNotice() {
  preferencesStore.setHomeNoticeVisible(false)
}
</script>

<template>
  <view class="flex flex-col gap-[24rpx] pb-[24rpx]">
    <view class="rounded-[32rpx] px-[32rpx] py-[40rpx]" :style="heroStyle">
      <view class="flex flex-col gap-[20rpx]">
        <view class="w-fit inline-flex items-center rounded-[16rpx] bg-glass px-[20rpx] py-[8rpx]">
          <text class="text-[24rpx] text-inverse-subtle leading-[1.3]">
            @duxweb/uni Runtime
          </text>
        </view>
        <view class="max-w-[580rpx] text-[48rpx] text-inverse font-bold leading-tight">
          {{ overview?.greeting || '加载中...' }}
        </view>
        <view class="text-[26rpx] text-inverse-muted leading-relaxed">
          {{ overview?.subtitle }}
        </view>
        <view class="flex flex-wrap gap-[12rpx]">
          <view class="inline-flex items-center rounded-full bg-glass px-[20rpx] py-[8rpx]">
            <text class="text-[24rpx] text-inverse leading-[1.3]">
              已登录：{{ currentUser }}
            </text>
          </view>
          <view class="inline-flex items-center rounded-full bg-glass px-[20rpx] py-[8rpx]">
            <text class="text-[24rpx] text-inverse leading-[1.3]">
              网络：{{ network.isOnline ? '在线' : '离线' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view>
      <view class="mb-[16rpx] flex items-center justify-between">
        <text class="text-[32rpx] text-neutral-stronger font-semibold">
          核心能力
        </text>
        <wd-button size="small" plain @click="refreshOverview">
          刷新
        </wd-button>
      </view>
      <view class="grid grid-cols-2 gap-[16rpx]">
        <view
          v-for="item in coreFeatures"
          :key="item.key"
          class="min-h-[224rpx] flex flex-col items-start justify-between rounded-[28rpx] bg-surface p-[24rpx] shadow-card-strong"
        >
          <view
            class="h-[84rpx] w-[84rpx] flex items-center justify-center rounded-[24rpx]"
            :style="{ backgroundColor: `var(--dux-color-${item.tone}-soft)` }"
          >
            <wd-icon :name="item.icon" size="24px" :color="`var(--dux-color-${item.tone})`" />
          </view>
          <view class="flex flex-col items-start gap-[10rpx] pt-[18rpx]">
            <text class="text-[28rpx] text-neutral-stronger font-semibold">
              {{ item.title }}
            </text>
            <text class="text-[24rpx] text-neutral-muted leading-[1.5]">
              {{ item.summary }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view>
      <view class="mb-[16rpx] flex items-center justify-between">
        <text class="text-[32rpx] text-neutral-stronger font-semibold">
          能力亮点
        </text>
      </view>
      <view class="flex flex-col gap-[16rpx]">
        <view
          v-for="item in overview?.highlights || []"
          :key="item.id"
          class="flex items-start gap-[18rpx] rounded-[24rpx] bg-surface p-[24rpx] shadow-card"
        >
          <view class="h-[76rpx] w-[76rpx] flex shrink-0 items-center justify-center rounded-[22rpx] bg-primary-soft">
            <wd-icon :name="highlightIconMap[item.tag] || 'setting'" size="22px" color="var(--dux-color-primary)" />
          </view>
          <view class="flex flex-1 flex-col gap-[10rpx]">
            <view class="flex items-center justify-between gap-[12rpx]">
              <text class="text-[28rpx] text-neutral-stronger font-semibold">
                {{ item.title }}
              </text>
              <view class="inline-flex items-center rounded-full bg-primary-soft px-[18rpx] py-[6rpx]">
                <text class="text-[22rpx] text-primary-active font-medium leading-[1.3]">
                  {{ item.tag }}
                </text>
              </view>
            </view>
            <text class="text-[24rpx] text-neutral-muted leading-[1.6]">
              {{ item.summary }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view>
      <view class="flex flex-col gap-[18rpx] rounded-[28rpx] bg-surface p-[28rpx] shadow-card">
        <view class="flex items-center justify-between gap-[16rpx]">
          <view class="flex flex-col gap-[10rpx]">
            <text class="text-[32rpx] text-neutral-stronger font-semibold">
              UI 适配层
            </text>
            <text class="text-[24rpx] text-neutral-muted leading-relaxed">
              `@duxweb/uni` 负责运行时与数据层，`@duxweb/uni-pro` 负责把 Wot UI、主题 Token 和跨端界面整合成统一体验。
            </text>
          </view>
          <view class="h-[88rpx] w-[88rpx] flex shrink-0 items-center justify-center rounded-[24rpx] bg-primary-soft">
            <wd-icon name="setting" size="26px" color="var(--dux-color-primary)" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
