<route lang="json">
{
  "title": "表单",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import { usePageTitle, useRouter } from '@duxweb/uni'
import { wrapAsyncEvent } from '@/utils/async'

const router = useRouter()

const demos = [
  { title: '新增表单', label: 'AsyncForm create + picker + upload', path: '/pages/form/create' },
  { title: '编辑表单', label: 'AsyncForm edit + 详情回填', path: '/pages/form/edit' },
  { title: '异步选择器', label: 'AsyncPickerView 内嵌选择', path: '/pages/form/picker' },
  { title: '远程搜索', label: 'AsyncPicker + search()', path: '/pages/form/search' },
  { title: '远程级联', label: 'AsyncColPicker + loader', path: '/pages/form/cascade' },
  { title: '动态渲染', label: 'useJsonSchema + SchemaRenderer', path: '/pages/form/schema' },
]

usePageTitle('表单')

const open = wrapAsyncEvent('form.index.open', async (path: string) => {
  await router.to(path)
})
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx]">
      <wd-cell-group border>
        <wd-cell
          v-for="item in demos"
          :key="item.path"
          :title="item.title"
          :label="item.label"
          is-link
          @click="open(item.path)"
        />
      </wd-cell-group>
    </view>
  </view>
</template>
