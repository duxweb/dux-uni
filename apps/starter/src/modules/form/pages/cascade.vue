<route lang="json">
{
  "title": "远程级联",
  "tabBarActive": "feature"
}
</route>

<script setup lang="ts">
import { useDux, usePageTitle } from '@duxweb/uni'
import AsyncColPicker from '@duxweb/uni-pro/components/AsyncColPicker.vue'
import { ref } from 'vue'

const app = useDux()
const dataProvider = app.config.dataProvider
const lazyCategoryIds = ref<Array<string | number>>([])

async function loadLazyCategoryOptions(input: {
  level: number
  values: Array<string | number>
}) {
  if (!dataProvider) {
    return []
  }

  const parentId = Number(input.values.at(-1) || 0)
  const result = await dataProvider.getList({
    path: 'demo/category-options',
    filters: {
      parentId,
    },
  }, app, app.session.getAuth() || null)

  return Array.isArray(result.data) ? result.data : []
}

usePageTitle('远程级联')
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="flex flex-col gap-[18rpx] overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <AsyncColPicker
        v-model="lazyCategoryIds"
        label="远程分类"
        title="选择远程分类"
        placeholder="请选择分类路径"
        value-key="id"
        label-key="name"
        :loader="loadLazyCategoryOptions"
      />
    </view>

    <view class="overflow-hidden rounded-[24rpx] bg-surface p-[24rpx]">
      <view class="overflow-hidden rounded-[24rpx]">
        <wd-cell-group border>
          <wd-cell title="当前路径" :value="lazyCategoryIds.length ? lazyCategoryIds.join(' / ') : '未选择'" />
          <wd-cell title="加载方式" value="loader(parentId) -> category-options" />
        </wd-cell-group>
      </view>
    </view>
  </view>
</template>
