<route lang="json">
{
  "title": "功能"
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'
import { wrapAsyncEvent } from '@/utils/async'

const router = useRouter()

const demoGroups = [
  {
    key: 'data',
    title: '数据查询与列表',
    description: '分页列表、无限滚动、CRUD、查询失效刷新都集中在一个页面里演示。',
    tags: ['useList', 'useInfiniteList', 'useCreate', 'useUpdate', 'useDelete', 'useInvalidate'],
    path: '/pages/list/index',
  },
  {
    key: 'form',
    title: '表单与 Schema',
    description: 'AsyncForm、AsyncPicker、AsyncColPicker、AsyncPickerView 与 JSON 动态渲染统一收敛在表单页。',
    tags: ['AsyncForm', 'AsyncPicker', 'AsyncColPicker', 'useJsonSchema'],
    path: '/pages/form/index',
  },
  {
    key: 'files',
    title: '上传与下载',
    description: 'AsyncUpload 负责接 Wot 上传交互，下载仍由 useDownload 保持 headless 运行时能力。',
    tags: ['AsyncUpload', 'useUpload', 'useDownload'],
    path: '/pages/feature/files',
  },
  {
    key: 'overlay',
    title: '弹层运行时',
    description: '统一的 confirm、modal、drawer hooks，对 UI 层只暴露结果和上下文。',
    tags: ['useConfirm', 'useModal', 'useDrawer', 'overlay'],
    path: '/pages/feature/overlay',
  },
  {
    key: 'realtime',
    title: '实时协议',
    description: '拆成 SSE 与 WebSocket 两个子页，分别测试连接、消息和关闭逻辑。',
    tags: ['useSocket', 'useSSE', 'SSE', 'WebSocket'],
    path: '/pages/feature/realtime',
  },
  {
    key: 'device',
    title: '设备能力',
    description: '集中演示相机调用、定位获取、地图选点与地图打开能力。',
    tags: ['useImagePicker', 'useLocation', 'camera', 'map'],
    path: '/pages/feature/device',
  },
  {
    key: 'permission',
    title: '权限与中间件',
    description: '展示 useCan、页面 permission 元信息以及默认无权限跳转能力。',
    tags: ['useCan', 'permission', 'middleware', 'forbidden'],
    path: '/pages/feature/permission',
  },
]

const heroStyle = {
  backgroundColor: 'var(--dux-color-primary)',
}

usePageTitle('功能')

const open = wrapAsyncEvent('feature.index.open', async (path: string) => {
  await router.to(path)
})
</script>

<template>
  <view class="feature-page flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[14rpx] rounded-[28rpx] p-[28rpx]" :style="heroStyle">
      <view class="w-fit inline-flex items-center rounded-[16rpx] bg-glass px-[20rpx] py-[8rpx]">
        <text class="text-[24rpx] text-inverse-subtle leading-[1.3]">
          Feature Catalog
        </text>
      </view>
      <text class="text-[40rpx] text-inverse font-bold">
        所有演示能力都从这里进入
      </text>
      <text class="text-[24rpx] text-inverse-muted leading-relaxed">
        tab 页只保留一级信息结构，真正的 Hook、查询、表单、文件等能力都通过目录页进入对应演示页面。
      </text>
    </view>

    <view class="overflow-hidden rounded-[18rpx]">
      <wd-notice-bar
        text="功能页是能力目录，不直接堆砌 demo 细节。每个入口都对应一个完整场景页。"
        prefix="warn-bold"
        :scrollable="false"
      />
    </view>

    <view class="flex flex-col gap-[18rpx]">
      <view
        v-for="item in demoGroups"
        :key="item.key"
        class="flex flex-col gap-[16rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]"
      >
        <view class="flex items-start justify-between gap-[16rpx]">
          <view class="flex flex-1 flex-col gap-[10rpx]">
            <text class="text-[30rpx] text-neutral-stronger font-semibold">
              {{ item.title }}
            </text>
            <text class="text-[24rpx] text-neutral-muted leading-relaxed">
              {{ item.description }}
            </text>
          </view>
          <wd-button size="small" type="primary" plain @click="open(item.path)">
            进入演示
          </wd-button>
        </view>
        <view class="flex flex-wrap gap-[10rpx]">
          <view
            v-for="tag in item.tags"
            :key="tag"
            class="inline-flex items-center rounded-full bg-primary-soft px-[18rpx] py-[6rpx]"
          >
            <text class="text-[22rpx] text-primary-active font-medium leading-[1.3]">
              {{ tag }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
